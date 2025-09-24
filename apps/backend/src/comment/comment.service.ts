import { 
  Injectable, 
  Logger, 
  NotFoundException, 
  BadRequestException,
  ForbiddenException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment, CommentableType } from './entities/comment.entity';
import { CreateCommentDto } from './dtos/create-comment.dto';
import { UpdateCommentDto } from './dtos/update-comment.dto';
import { TaskService } from '../task/task.service';
import { ProjectService } from '../project/project.service';
import { BoardService } from '../board/board.service';
import { SubtaskService } from '../subtask/subtask.service';
import { QueryCommentDto } from './dtos/query-comment.dto';

@Injectable()
export class CommentService {
  private readonly logger = new Logger(CommentService.name);

  constructor(
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
    private readonly taskService: TaskService,
    private readonly projectService: ProjectService,
    private readonly boardService: BoardService,
    private readonly subtaskService: SubtaskService,
  ) {}

  async create(createCommentDto: CreateCommentDto, userId: string): Promise<Comment> {
    this.logger.log(`Creating comment on ${createCommentDto.commentableType}: ${createCommentDto.commentableId} by user: ${userId}`);
    
    // Validate access to the commentable entity
    await this.validateCommentableAccess(
      createCommentDto.commentableType, 
      createCommentDto.commentableId, 
      userId
    );

    // Validate parent comment if replying
    if (createCommentDto.parentCommentId) {
      const parentComment = await this.findOne(createCommentDto.parentCommentId, userId);
      
      // Ensure reply is on the same entity
      if (parentComment.commentableType !== createCommentDto.commentableType || 
          parentComment.commentableId !== createCommentDto.commentableId) {
        throw new BadRequestException('Reply must be on the same entity as parent comment');
      }
    }

    const comment = this.commentRepo.create({
      ...createCommentDto,
      authorId: userId,
    });

    const savedComment = await this.commentRepo.save(comment);
    this.logger.log(`Comment created: ${savedComment.id}`);
    
    return this.findOne(savedComment.id, userId);
  }

  async findByEntity(queryDto: QueryCommentDto, userId: string): Promise<Comment[]> {
    this.logger.log(`Finding comments for ${queryDto.commentableType}: ${queryDto.commentableId}`);
    
    // Validate access to the commentable entity
    await this.validateCommentableAccess(queryDto.commentableType, queryDto.commentableId, userId);

    const queryBuilder = this.commentRepo
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.author', 'author')
      .where('comment.commentableType = :type', { type: queryDto.commentableType })
      .andWhere('comment.commentableId = :id', { id: queryDto.commentableId });

    // Filter by parent comment if specified
    if (queryDto.parentCommentId !== undefined) {
      if (queryDto.parentCommentId === null) {
        // Get top-level comments only
        queryBuilder.andWhere('comment.parentCommentId IS NULL');
      } else {
        // Get replies to specific comment
        queryBuilder.andWhere('comment.parentCommentId = :parentId', { 
          parentId: queryDto.parentCommentId 
        });
      }
    }

    // Include replies if requested
    if (queryDto.includeReplies) {
      queryBuilder.leftJoinAndSelect('comment.replies', 'replies')
                  .leftJoinAndSelect('replies.author', 'replyAuthor');
    }

    const comments = await queryBuilder
      .orderBy('comment.createdAt', 'ASC')
      .addOrderBy('replies.createdAt', 'ASC')
      .getMany();

    this.logger.log(`Found ${comments.length} comments for ${queryDto.commentableType}: ${queryDto.commentableId}`);
    return comments;
  }

  async findOne(id: string, userId: string): Promise<Comment> {
    this.logger.log(`Finding comment: ${id} for user: ${userId}`);
    
    const comment = await this.commentRepo.findOne({
      where: { id },
      relations: ['author', 'parentComment', 'replies', 'replies.author'],
    });

    if (!comment) {
      this.logger.error(`Comment not found: ${id}`);
      throw new NotFoundException(`Comment ${id} not found`);
    }

    // Validate access to the commentable entity
    await this.validateCommentableAccess(comment.commentableType, comment.commentableId, userId);

    this.logger.log(`Comment found: ${comment.id}`);
    return comment;
  }

  async update(id: string, updateCommentDto: UpdateCommentDto, userId: string): Promise<Comment> {
    this.logger.log(`Updating comment: ${id} by user: ${userId}`);
    
    const comment = await this.findOne(id, userId);

    // Only author can edit their comment
    if (comment.authorId !== userId) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    comment.content = updateCommentDto.content;
    comment.isEdited = true;

    const updatedComment = await this.commentRepo.save(comment);
    this.logger.log(`Comment updated: ${updatedComment.id}`);
    
    return this.findOne(updatedComment.id, userId);
  }

  async remove(id: string, userId: string): Promise<void> {
    this.logger.log(`Soft deleting comment: ${id} by user: ${userId}`);
    
    const comment = await this.findOne(id, userId);

    // Only author can delete their comment (or you could add admin logic here)
    if (comment.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.commentRepo.softDelete(id);
    this.logger.log(`Comment soft deleted: ${id}`);
  }

  async findUserComments(userId: string): Promise<Comment[]> {
    this.logger.log(`Finding all comments by user: ${userId}`);
    
    const comments = await this.commentRepo.find({
      where: { authorId: userId },
      relations: ['author', 'parentComment'],
      order: { createdAt: 'DESC' },
    });

    this.logger.log(`Found ${comments.length} comments by user: ${userId}`);
    return comments;
  }

  async getCommentStats(commentableType: CommentableType, commentableId: string, userId: string): Promise<{
    totalComments: number;
    topLevelComments: number;
    replies: number;
  }> {
    this.logger.log(`Getting comment stats for ${commentableType}: ${commentableId}`);
    
    // Validate access
    await this.validateCommentableAccess(commentableType, commentableId, userId);

    const [totalComments, topLevelComments] = await Promise.all([
      this.commentRepo.count({
        where: { commentableType, commentableId },
      }),
      this.commentRepo.count({
        where: { commentableType, commentableId, parentCommentId: null },
      }),
    ]);

    const replies = totalComments - topLevelComments;

    return { totalComments, topLevelComments, replies };
  }

  private async validateCommentableAccess(
    commentableType: CommentableType,
    commentableId: string,
    userId: string,
  ): Promise<void> {
    try {
      switch (commentableType) {
        case CommentableType.TASK:
          await this.taskService.findOne(commentableId, userId);
          break;
        case CommentableType.PROJECT:
          await this.projectService.findOne(commentableId, userId);
          break;
        case CommentableType.BOARD:
          await this.boardService.findOne(commentableId, userId);
          break;
        case CommentableType.SUBTASK:
          await this.subtaskService.findOne(commentableId, userId);
          break;
        default:
          throw new BadRequestException(`Unsupported commentable type: ${commentableType}`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(`${commentableType} ${commentableId} not found or access denied`);
      }
      throw error;
    }
  }
}