import { 
  Injectable, 
  Logger, 
  NotFoundException, 
  BadRequestException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BoardSubitem } from './entities/subtask.entity';
import { CreateSubtaskDto } from './dtos/create-subtask.dto';
import { UpdateSubtaskDto } from './dtos/update-subtask.dto';
import { TaskService } from '../task/task.service';
import { UserService } from '../user/user.service';

@Injectable()
export class SubtaskService {
  private readonly logger = new Logger(SubtaskService.name);

  constructor(
    @InjectRepository(BoardSubitem)
    private readonly subtaskRepo: Repository<BoardSubitem>,
    private readonly taskService: TaskService,
    private readonly userService: UserService,
  ) {}

  async create(createSubtaskDto: CreateSubtaskDto, userId: string): Promise<BoardSubitem> {
    this.logger.log(`Creating subtask: ${createSubtaskDto.name || createSubtaskDto.title} for task: ${createSubtaskDto.itemId || createSubtaskDto.taskId} by user: ${userId}`);
    
    // Verify user has access to the parent task
    const itemId = createSubtaskDto.itemId || createSubtaskDto.taskId;
    await this.taskService.findOne(itemId, userId);

    // Validate assignee if provided
    const assigneeId = createSubtaskDto.assigneeId;
    if (assigneeId) {
      await this.userService.findOne(assigneeId);
    }

    // If no position specified, put at the end
    if (createSubtaskDto.position === undefined) {
      const maxPosition = await this.subtaskRepo
        .createQueryBuilder('subtask')
        .select('MAX(subtask.position)', 'max')
        .where('subtask.itemId = :itemId', { itemId })
        .getRawOne();
      
      createSubtaskDto.position = (maxPosition?.max || 0) + 1;
    }

    const subtask = this.subtaskRepo.create({
      name: createSubtaskDto.name || createSubtaskDto.title,
      description: createSubtaskDto.description,
      completed: createSubtaskDto.completed,
      itemId: itemId,
      assigneeId: assigneeId,
      position: createSubtaskDto.position,
      createdById: userId,
    });

    const savedBoardSubitem = await this.subtaskRepo.save(subtask);
    this.logger.log(`BoardSubitem created: ${savedBoardSubitem.id}`);
    
    return this.findOne(savedBoardSubitem.id, userId);
  }

  async findAllByTask(itemId: string, userId: string): Promise<BoardSubitem[]> {
    this.logger.log(`Finding subtasks for task: ${itemId} by user: ${userId}`);
    
    // Verify user has access to the parent task
    await this.taskService.findOne(itemId, userId);

    const subtasks = await this.subtaskRepo.find({
      where: { itemId },
      relations: ['task', 'createdBy', 'assignedTo'],
      order: { position: 'ASC' },
    });

    this.logger.log(`Found ${subtasks.length} subtasks for task: ${itemId}`);
    return subtasks;
  }

  async findOne(id: string, userId: string): Promise<BoardSubitem> {
    this.logger.log(`Finding subtask: ${id} for user: ${userId}`);
    
    const subtask = await this.subtaskRepo.findOne({
      where: { id },
      relations: ['task', 'createdBy', 'assignedTo'],
    });

    if (!subtask) {
      this.logger.error(`BoardSubitem not found: ${id}`);
      throw new NotFoundException(`BoardSubitem ${id} not found`);
    }

    // Check if user has access to the parent task
    await this.taskService.findOne(subtask.itemId, userId);

    this.logger.log(`BoardSubitem found: ${subtask.name} (ID: ${subtask.id})`);
    return subtask;
  }

  async update(id: string, updateSubtaskDto: UpdateSubtaskDto, userId: string): Promise<BoardSubitem> {
    this.logger.log(`Updating subtask: ${id} by user: ${userId}`);
    
    const subtask = await this.findOne(id, userId);

    // Validate new assignee if provided
    if (updateSubtaskDto.assigneeId) {
      await this.userService.findOne(updateSubtaskDto.assigneeId);
    }

    Object.assign(subtask, updateSubtaskDto);
    const updatedBoardSubitem = await this.subtaskRepo.save(subtask);
    
    this.logger.log(`BoardSubitem updated: ${updatedBoardSubitem.id}`);
    return this.findOne(updatedBoardSubitem.id, userId);
  }

  async remove(id: string, userId: string): Promise<void> {
    this.logger.log(`Soft deleting subtask: ${id} by user: ${userId}`);
    
    await this.findOne(id, userId);
    
    await this.subtaskRepo.softDelete(id);
    this.logger.log(`BoardSubitem soft deleted: ${id}`);
  }

  async toggleComplete(id: string, userId: string): Promise<BoardSubitem> {
    this.logger.log(`Toggling completion status for subtask: ${id} by user: ${userId}`);
    
    const subtask = await this.findOne(id, userId);
    subtask.completed = !subtask.completed;
    
    const updatedBoardSubitem = await this.subtaskRepo.save(subtask);
    this.logger.log(`BoardSubitem completion toggled: ${updatedBoardSubitem.id} - completed: ${updatedBoardSubitem.completed}`);
    
    return this.findOne(updatedBoardSubitem.id, userId);
  }

  async reorderBoardSubitems(itemId: string, subitemIds: string[], userId: string): Promise<BoardSubitem[]> {
    this.logger.log(`Reordering subtasks for task: ${itemId} by user: ${userId}`);
    
    // Verify user has access to the parent task
    await this.taskService.findOne(itemId, userId);

    // Validate all subtask IDs belong to the task
    const existingBoardSubitems = await this.subtaskRepo.find({
      where: { itemId },
      select: ['id'],
    });

    const existingIds = existingBoardSubitems.map(s => s.id);
    const invalidIds = subitemIds.filter(id => !existingIds.includes(id));
    
    if (invalidIds.length > 0) {
      throw new BadRequestException(`Some subtasks do not belong to task ${itemId}: ${invalidIds.join(', ')}`);
    }

    // Update positions
    const updatePromises = subitemIds.map((subitemId, index) =>
      this.subtaskRepo.update(subitemId, { position: index + 1 })
    );

    await Promise.all(updatePromises);

    // Return updated subtasks in order
    const updatedBoardSubitems = await this.findAllByTask(itemId, userId);
    this.logger.log(`BoardSubitems reordered for task: ${itemId}`);
    
    return updatedBoardSubitems;
  }

  async findUserBoardSubitems(userId: string): Promise<BoardSubitem[]> {
    this.logger.log(`Finding all subtasks for user: ${userId}`);
    
    const subtasks = await this.subtaskRepo
      .createQueryBuilder('subtask')
      .leftJoinAndSelect('subtask.task', 'task')
      .leftJoinAndSelect('subtask.createdBy', 'createdBy')
      .leftJoinAndSelect('subtask.assignedTo', 'assignedTo')
      .where('(subtask.createdById = :userId OR subtask.assignedToId = :userId)', { userId })
      .orderBy('subtask.completed', 'ASC')
      .addOrderBy('subtask.updatedAt', 'DESC')
      .getMany();

    this.logger.log(`Found ${subtasks.length} subtasks for user: ${userId}`);
    return subtasks;
  }

  async getTaskCompletionStats(itemId: string, userId: string): Promise<{ total: number; completed: number; percentage: number }> {
    this.logger.log(`Getting completion stats for task: ${itemId}`);
    
    // Verify user has access to the parent task
    await this.taskService.findOne(itemId, userId);

    const [total, completed] = await Promise.all([
      this.subtaskRepo.count({ where: { itemId } }),
      this.subtaskRepo.count({ where: { itemId, completed: true } }),
    ]);

    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, percentage };
  }

  // Backward compatibility aliases
  async findUserSubtasks(userId: string): Promise<BoardSubitem[]> {
    return this.findUserBoardSubitems(userId);
  }

  async reorderSubtasks(taskId: string, subtaskIds: string[], userId: string): Promise<BoardSubitem[]> {
    return this.reorderBoardSubitems(taskId, subtaskIds, userId);
  }
}