import { 
  Injectable, 
  Logger, 
  NotFoundException, 
  BadRequestException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subtask } from './entities/subtask.entity';
import { CreateSubtaskDto } from './dtos/create-subtask.dto';
import { UpdateSubtaskDto } from './dtos/update-subtask.dto';
import { TaskService } from '../task/task.service';
import { UserService } from '../user/user.service';

@Injectable()
export class SubtaskService {
  private readonly logger = new Logger(SubtaskService.name);

  constructor(
    @InjectRepository(Subtask)
    private readonly subtaskRepo: Repository<Subtask>,
    private readonly taskService: TaskService,
    private readonly userService: UserService,
  ) {}

  async create(createSubtaskDto: CreateSubtaskDto, userId: string): Promise<Subtask> {
    this.logger.log(`Creating subtask: ${createSubtaskDto.title} for task: ${createSubtaskDto.taskId} by user: ${userId}`);
    
    // Verify user has access to the parent task
    await this.taskService.findOne(createSubtaskDto.taskId, userId);

    // Validate assignee if provided
    if (createSubtaskDto.assignedToId) {
      await this.userService.findOne(createSubtaskDto.assignedToId);
    }

    // If no position specified, put at the end
    if (createSubtaskDto.position === undefined) {
      const maxPosition = await this.subtaskRepo
        .createQueryBuilder('subtask')
        .select('MAX(subtask.position)', 'max')
        .where('subtask.taskId = :taskId', { taskId: createSubtaskDto.taskId })
        .getRawOne();
      
      createSubtaskDto.position = (maxPosition?.max || 0) + 1;
    }

    const subtask = this.subtaskRepo.create({
      ...createSubtaskDto,
      createdById: userId,
    });

    const savedSubtask = await this.subtaskRepo.save(subtask);
    this.logger.log(`Subtask created: ${savedSubtask.id}`);
    
    return this.findOne(savedSubtask.id, userId);
  }

  async findAllByTask(taskId: string, userId: string): Promise<Subtask[]> {
    this.logger.log(`Finding subtasks for task: ${taskId} by user: ${userId}`);
    
    // Verify user has access to the parent task
    await this.taskService.findOne(taskId, userId);

    const subtasks = await this.subtaskRepo.find({
      where: { taskId },
      relations: ['task', 'createdBy', 'assignedTo'],
      order: { position: 'ASC' },
    });

    this.logger.log(`Found ${subtasks.length} subtasks for task: ${taskId}`);
    return subtasks;
  }

  async findOne(id: string, userId: string): Promise<Subtask> {
    this.logger.log(`Finding subtask: ${id} for user: ${userId}`);
    
    const subtask = await this.subtaskRepo.findOne({
      where: { id },
      relations: ['task', 'createdBy', 'assignedTo'],
    });

    if (!subtask) {
      this.logger.warn(`Subtask not found: ${id}`);
      throw new NotFoundException(`Subtask ${id} not found`);
    }

    // Check if user has access to the parent task
    await this.taskService.findOne(subtask.taskId, userId);

    this.logger.log(`Subtask found: ${subtask.title} (ID: ${subtask.id})`);
    return subtask;
  }

  async update(id: string, updateSubtaskDto: UpdateSubtaskDto, userId: string): Promise<Subtask> {
    this.logger.log(`Updating subtask: ${id} by user: ${userId}`);
    
    const subtask = await this.findOne(id, userId);

    // Validate new assignee if provided
    if (updateSubtaskDto.assignedToId) {
      await this.userService.findOne(updateSubtaskDto.assignedToId);
    }

    Object.assign(subtask, updateSubtaskDto);
    const updatedSubtask = await this.subtaskRepo.save(subtask);
    
    this.logger.log(`Subtask updated: ${updatedSubtask.id}`);
    return this.findOne(updatedSubtask.id, userId);
  }

  async remove(id: string, userId: string): Promise<void> {
    this.logger.log(`Soft deleting subtask: ${id} by user: ${userId}`);
    
    await this.findOne(id, userId);
    
    await this.subtaskRepo.softDelete(id);
    this.logger.log(`Subtask soft deleted: ${id}`);
  }

  async toggleComplete(id: string, userId: string): Promise<Subtask> {
    this.logger.log(`Toggling completion status for subtask: ${id} by user: ${userId}`);
    
    const subtask = await this.findOne(id, userId);
    subtask.completed = !subtask.completed;
    
    const updatedSubtask = await this.subtaskRepo.save(subtask);
    this.logger.log(`Subtask completion toggled: ${updatedSubtask.id} - completed: ${updatedSubtask.completed}`);
    
    return this.findOne(updatedSubtask.id, userId);
  }

  async reorderSubtasks(taskId: string, subtaskIds: string[], userId: string): Promise<Subtask[]> {
    this.logger.log(`Reordering subtasks for task: ${taskId} by user: ${userId}`);
    
    // Verify user has access to the parent task
    await this.taskService.findOne(taskId, userId);

    // Validate all subtask IDs belong to the task
    const existingSubtasks = await this.subtaskRepo.find({
      where: { taskId },
      select: ['id'],
    });

    const existingIds = existingSubtasks.map(s => s.id);
    const invalidIds = subtaskIds.filter(id => !existingIds.includes(id));
    
    if (invalidIds.length > 0) {
      throw new BadRequestException(`Some subtasks do not belong to task ${taskId}: ${invalidIds.join(', ')}`);
    }

    // Update positions
    const updatePromises = subtaskIds.map((subtaskId, index) =>
      this.subtaskRepo.update(subtaskId, { position: index + 1 })
    );

    await Promise.all(updatePromises);

    // Return updated subtasks in order
    const updatedSubtasks = await this.findAllByTask(taskId, userId);
    this.logger.log(`Subtasks reordered for task: ${taskId}`);
    
    return updatedSubtasks;
  }

  async findUserSubtasks(userId: string): Promise<Subtask[]> {
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

  async getTaskCompletionStats(taskId: string, userId: string): Promise<{ total: number; completed: number; percentage: number }> {
    this.logger.log(`Getting completion stats for task: ${taskId}`);
    
    // Verify user has access to the parent task
    await this.taskService.findOne(taskId, userId);

    const [total, completed] = await Promise.all([
      this.subtaskRepo.count({ where: { taskId } }),
      this.subtaskRepo.count({ where: { taskId, completed: true } }),
    ]);

    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, percentage };
  }
}