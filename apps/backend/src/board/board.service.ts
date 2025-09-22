import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Board } from './entities/board.entity';
import { ProjectService } from '../project/project.service';
import { CreateBoardDto } from './dtos/create-board.dto';
import { UpdateBoardDto } from './dtos/update-board.dto';
import { ReorderBoardsDto } from './dtos/reorder-board.dto';

@Injectable()
export class BoardService {
  private readonly logger = new Logger(BoardService.name);

  constructor(
    @InjectRepository(Board)
    private readonly boardRepo: Repository<Board>,
    private readonly projectService: ProjectService
  ) {}

  async create(createBoardDto: CreateBoardDto, userId: string): Promise<Board> {
    this.logger.log(
      `Creating board: ${createBoardDto.name} in project: ${createBoardDto.projectId} by user: ${userId}`
    );

    // Verify user has access to project
    await this.projectService.findOne(createBoardDto.projectId, userId);

    // If no position specified, put at the end
    if (createBoardDto.position === undefined) {
      const maxPosition = await this.boardRepo
        .createQueryBuilder('board')
        .select('MAX(board.position)', 'max')
        .where('board.projectId = :projectId', {
          projectId: createBoardDto.projectId
        })
        .getRawOne();

      createBoardDto.position = (maxPosition?.max || 0) + 1;
    }

    const board = this.boardRepo.create(createBoardDto);
    const savedBoard = await this.boardRepo.save(board);

    this.logger.log(`Board created: ${savedBoard.id}`);
    return savedBoard;
  }

  async findAllByProject(projectId: string, userId: string): Promise<Board[]> {
    this.logger.log(
      `Finding boards in project: ${projectId} for user: ${userId}`
    );

    // Verify user has access to project
    await this.projectService.findOne(projectId, userId);

    const boards = await this.boardRepo.find({
      where: { projectId },
      relations: ['project'],
      order: { position: 'ASC' }
    });

    this.logger.log(`Found ${boards.length} boards in project: ${projectId}`);
    return boards;
  }

  async findOne(id: string, userId: string): Promise<Board> {
    this.logger.log(`Finding board: ${id} for user: ${userId}`);

    const board = await this.boardRepo.findOne({
      where: { id },
      relations: ['project']
    });

    if (!board) {
      this.logger.warn(`Board not found: ${id}`);
      throw new NotFoundException(`Board ${id} not found`);
    }

    // Check if user has access to the project
    await this.projectService.findOne(board.projectId, userId);

    this.logger.log(`Board found: ${board.name} (ID: ${board.id})`);
    return board;
  }

  async update(
    id: string,
    updateBoardDto: UpdateBoardDto,
    userId: string
  ): Promise<Board> {
    this.logger.log(`Updating board: ${id} by user: ${userId}`);

    const board = await this.findOne(id, userId);

    // Check if user can edit the project
    await this.projectService.checkProjectEditAccess(board.projectId, userId);

    Object.assign(board, updateBoardDto);
    const updatedBoard = await this.boardRepo.save(board);

    this.logger.log(`Board updated: ${updatedBoard.id}`);
    return updatedBoard;
  }

  async remove(id: string, userId: string): Promise<void> {
    this.logger.log(`Soft deleting board: ${id} by user: ${userId}`);

    const board = await this.findOne(id, userId);

    // Check if user can edit the project
    await this.projectService.checkProjectEditAccess(board.projectId, userId);

    await this.boardRepo.softDelete(id);
    this.logger.log(`Board soft deleted: ${id}`);
  }

  async reorderBoards(
    projectId: string,
    reorderDto: ReorderBoardsDto,
    userId: string
  ): Promise<Board[]> {
    this.logger.log(
      `Reordering boards in project: ${projectId} by user: ${userId}`
    );

    // Verify user has access to project
    await this.projectService.checkProjectEditAccess(projectId, userId);

    // Validate all board IDs belong to the project
    const boardIds = reorderDto.boards.map(b => b.id);
    const existingBoards = await this.boardRepo.find({
      where: { projectId, id: In(boardIds) }
    });

    if (existingBoards.length !== boardIds.length) {
      this.logger.warn(`Some boards don't belong to project ${projectId}`);
      throw new BadRequestException(
        'Some boards do not belong to this project'
      );
    }

    // Update positions
    const updatePromises = reorderDto.boards.map(boardUpdate =>
      this.boardRepo.update(boardUpdate.id, { position: boardUpdate.position })
    );

    await Promise.all(updatePromises);

    // Return updated boards in order
    const updatedBoards = await this.findAllByProject(projectId, userId);
    this.logger.log(`Boards reordered in project: ${projectId}`);

    return updatedBoards;
  }

  async findUserBoards(userId: string): Promise<Board[]> {
    this.logger.log(`Finding all boards for user: ${userId}`);

    // Get all projects user has access to
    const userProjects = await this.projectService.findUserProjects(userId);
    const projectIds = userProjects.map(p => p.id);

    if (projectIds.length === 0) {
      return [];
    }

    const boards = await this.boardRepo
      .createQueryBuilder('board')
      .leftJoinAndSelect('board.project', 'project')
      .where('board.projectId IN (:...projectIds)', { projectIds })
      .orderBy('project.name', 'ASC')
      .addOrderBy('board.position', 'ASC')
      .getMany();

    this.logger.log(`Found ${boards.length} boards for user: ${userId}`);
    return boards;
  }
}
