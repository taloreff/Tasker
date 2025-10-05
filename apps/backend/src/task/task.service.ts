import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskStatus, TaskPriority } from './entities/task.entity';
import { CreateTaskDto } from './dtos/create-task.dto';
import { UpdateTaskDto } from './dtos/update-task.dto';
import { MoveTaskDto } from './dtos/move-task.dto';
import { AssignTaskDto } from './dtos/assign-task.dto';
import { BoardService } from '../board/board.service';
import { UserService } from '../user/user.service';
import { WorkspaceService } from '../workspace/workspace.service';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);

  constructor(
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
    private readonly boardService: BoardService,
    private readonly userService: UserService,
    private readonly workspaceService: WorkspaceService
  ) {}

  async create(createTaskDto: CreateTaskDto, userId: string): Promise<Task> {
    this.logger.log(
      `Creating task: ${createTaskDto.name} in board: ${createTaskDto.boardId}`
    );

    await this.boardService.findOne(createTaskDto.boardId, userId);

    if (createTaskDto.position === undefined) {
      const { max } = await this.taskRepo
        .createQueryBuilder('task')
        .select('MAX(task.position)', 'max')
        .where('task.boardId = :boardId', { boardId: createTaskDto.boardId })
        .getRawOne();
      createTaskDto.position = (max || 0) + 1;
    }

    if (createTaskDto.assigneeId) {
      await this.userService.findOne(createTaskDto.assigneeId);
    }

    const task = this.taskRepo.create({
      ...createTaskDto,
      createdById: userId
    });

    const saved = await this.taskRepo.save(task);
    return this.findOne(saved.id, userId);
  }

  async findAllByBoard(boardId: string, userId: string): Promise<Task[]> {
    await this.boardService.findOne(boardId, userId);

    const tasks = await this.taskRepo.find({
      where: { boardId },
      relations: ['assignee'],
      order: { position: 'ASC', createdAt: 'ASC' }
    });

    this.logger.log(`Found ${tasks.length} tasks in board: ${boardId}`);
    return tasks;
  }

  async findGroupedByBoard(
    boardId: string,
    groupBy: 'status' | 'priority',
    userId: string
  ) {
    const tasks = await this.findAllByBoard(boardId, userId);

    const grouped: Record<string, Task[]> = {};
    const order =
      groupBy === 'status'
        ? [
            TaskStatus.TODO,
            TaskStatus.IN_PROGRESS,
            TaskStatus.REVIEW,
            TaskStatus.DONE,
            TaskStatus.BLOCKED,
            TaskStatus.CANCELLED
          ]
        : [
            TaskPriority.LOW,
            TaskPriority.MEDIUM,
            TaskPriority.HIGH,
            TaskPriority.URGENT
          ];

    order.forEach(key => (grouped[key] = []));
    tasks.forEach(t => grouped[t[groupBy]].push(t));

    return grouped;
  }

  async findUserTasks(userId: string): Promise<Task[]> {
    this.logger.log(`Finding tasks for user: ${userId}`);

    const tasks = await this.taskRepo
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.assignee', 'assignee')
      .leftJoinAndSelect('task.board', 'board')
      .where('task.createdById = :userId OR task.assigneeId = :userId', {
        userId
      })
      .orderBy('task.updatedAt', 'DESC')
      .getMany();

    this.logger.log(`Found ${tasks.length} tasks for user: ${userId}`);
    return tasks;
  }

  async findOne(id: string, userId: string): Promise<Task> {
    const task = await this.taskRepo.findOne({
      where: { id },
      relations: ['assignee', 'board']
    });

    if (!task) throw new NotFoundException(`Task ${id} not found`);
    await this.boardService.findOne(task.boardId, userId);
    return task;
  }

  async update(id: string, dto: UpdateTaskDto, userId: string): Promise<Task> {
    const task = await this.findOne(id, userId);
    Object.assign(task, dto);
    await this.taskRepo.save(task);
    return this.findOne(id, userId);
  }

  async moveTask(id: string, dto: MoveTaskDto, userId: string): Promise<Task> {
    const task = await this.findOne(id, userId);
    console.log('🟢 Found task:', task.id);

    const newGroupId = dto.groupId || task.groupId;

    if (dto.position === undefined) {
      const { max } = await this.taskRepo
        .createQueryBuilder('task')
        .select('MAX(task.position)', 'max')
        .where('task.boardId = :boardId', { boardId: task.boardId })
        .getRawOne();
      dto.position = (max || 0) + 1;
    }

    console.log('🟢 Updating position to', dto.position);

    Object.assign(task, {
      position: dto.position,
      groupId: newGroupId
    });

    console.log("saved task:", task) 

    await this.taskRepo.update(task.id, {
      position: dto.position,
      groupId: newGroupId
    });

    console.log('🟢 Task saved, re-fetching...');

    const updated = await this.findOne(id, userId);
    console.log('✅ Move complete');
    return updated;
  }

  async assignTask(
    id: string,
    dto: AssignTaskDto,
    userId: string
  ): Promise<Task> {
    const task = await this.findOne(id, userId);
    const assigneeId = dto.assigneeIds?.[0];

    if (assigneeId) {
      const user = await this.userService.findOne(assigneeId);
      const board = await this.boardService.findOne(task.boardId, userId);
      const workspaceUsers = await this.workspaceService.findUserWorkspaces(
        assigneeId
      );
      const hasAccess = workspaceUsers.some(w => w.id === board.workspaceId);

      if (!hasAccess) {
        throw new BadRequestException(
          `User ${assigneeId} does not have access`
        );
      }

      task.assigneeId = user.id;
      await this.taskRepo.save(task);
    }

    return this.findOne(id, userId);
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.findOne(id, userId);
    await this.taskRepo.softDelete(id);
    this.logger.log(`Task soft deleted: ${id}`);
  }
}
