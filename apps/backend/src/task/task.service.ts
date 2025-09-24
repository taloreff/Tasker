import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskStatus } from './entities/task.entity';
import { CreateTaskDto } from './dtos/create-task.dto';
import { UpdateTaskDto } from './dtos/update-task.dto';
import { MoveTaskDto } from './dtos/move-task.dto';
import { AssignTaskDto } from './dtos/assign-task.dto';
import { BoardService } from '../board/board.service';
import { ColumnService } from '../column/column.service';
import { UserService } from '../user/user.service';
import { Label } from '../label/entities/label.entity';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);

  constructor(
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
    private readonly boardService: BoardService,
    private readonly columnService: ColumnService,
    private readonly userService: UserService
  ) {}

  async create(createTaskDto: CreateTaskDto, userId: string): Promise<Task> {
    this.logger.log(
      `Creating task: ${createTaskDto.title} in column: ${createTaskDto.columnId} by user: ${userId}`
    );

    await this.boardService.findOne(createTaskDto.boardId, userId);
    const column = await this.columnService.findOne(
      createTaskDto.columnId,
      userId
    );

    if (column.boardId !== createTaskDto.boardId) {
      throw new BadRequestException(
        'Column does not belong to the specified board'
      );
    }

    if (createTaskDto.position === undefined) {
      const maxPosition = await this.taskRepo
        .createQueryBuilder('task')
        .select('MAX(task.position)', 'max')
        .where('task.columnId = :columnId', {
          columnId: createTaskDto.columnId
        })
        .getRawOne();

      createTaskDto.position = (maxPosition?.max || 0) + 1;
    }

    if (createTaskDto.assigneeIds && createTaskDto.assigneeIds.length > 0) {
      for (const assigneeId of createTaskDto.assigneeIds) {
        await this.userService.findOne(assigneeId);
      }
    }

    const task = this.taskRepo.create({
      ...createTaskDto,
      createdById: userId
    });

    const savedTask = await this.taskRepo.save(task);

    if (createTaskDto.assigneeIds && createTaskDto.assigneeIds.length > 0) {
      await this.assignTask(
        savedTask.id,
        { assigneeIds: createTaskDto.assigneeIds },
        userId
      );
    }

    this.logger.log(`Task created: ${savedTask.id}`);
    return this.findOne(savedTask.id, userId);
  }

  async findAllByBoard(boardId: string, userId: string): Promise<Task[]> {
    this.logger.log(`Finding tasks in board: ${boardId} for user: ${userId}`);

    await this.boardService.findOne(boardId, userId);

    const tasks = await this.taskRepo.find({
      where: { boardId },
      relations: ['createdBy', 'column', 'board', 'assignees', 'labels'],
      order: { columnId: 'ASC', position: 'ASC' }
    });

    this.logger.log(`Found ${tasks.length} tasks in board: ${boardId}`);
    return tasks;
  }

  async findAllByColumn(columnId: string, userId: string): Promise<Task[]> {
    this.logger.log(`Finding tasks in column: ${columnId} for user: ${userId}`);

    await this.columnService.findOne(columnId, userId);

    const tasks = await this.taskRepo.find({
      where: { columnId },
      relations: ['createdBy', 'column', 'board', 'assignees', 'labels'],
      order: { position: 'ASC' }
    });

    this.logger.log(`Found ${tasks.length} tasks in column: ${columnId}`);
    return tasks;
  }

  async findOne(id: string, userId: string): Promise<Task> {
    this.logger.log(`Finding task: ${id} for user: ${userId}`);

    const task = await this.taskRepo.findOne({
      where: { id },
      relations: ['createdBy', 'column', 'board', 'assignees', 'labels']
    });

    if (!task) {
      this.logger.error(`Task not found: ${id}`);
      throw new NotFoundException(`Task ${id} not found`);
    }

    await this.boardService.findOne(task.boardId, userId);

    this.logger.log(`Task found: ${task.title} (ID: ${task.id})`);
    return task;
  }

  async update(
    id: string,
    updateTaskDto: UpdateTaskDto,
    userId: string
  ): Promise<Task> {
    this.logger.log(`Updating task: ${id} by user: ${userId}`);

    const task = await this.findOne(id, userId);

    if (updateTaskDto.columnId && updateTaskDto.columnId !== task.columnId) {
      const newColumn = await this.columnService.findOne(
        updateTaskDto.columnId,
        userId
      );
      if (newColumn.boardId !== task.boardId) {
        throw new BadRequestException(
          'Cannot move task to column in different board'
        );
      }
    }

    if (updateTaskDto.assigneeIds && updateTaskDto.assigneeIds.length > 0) {
      for (const assigneeId of updateTaskDto.assigneeIds) {
        await this.userService.findOne(assigneeId);
      }
    }

    Object.assign(task, updateTaskDto);
    const updatedTask = await this.taskRepo.save(task);

    if (updateTaskDto.assigneeIds !== undefined) {
      await this.assignTask(
        task.id,
        { assigneeIds: updateTaskDto.assigneeIds },
        userId
      );
    }

    this.logger.log(`Task updated: ${updatedTask.id}`);
    return this.findOne(updatedTask.id, userId);
  }

  async remove(id: string, userId: string): Promise<void> {
    this.logger.log(`Soft deleting task: ${id} by user: ${userId}`);

    await this.findOne(id, userId);

    await this.taskRepo.softDelete(id);
    this.logger.log(`Task soft deleted: ${id}`);
  }

  async moveTask(
    id: string,
    moveTaskDto: MoveTaskDto,
    userId: string
  ): Promise<Task> {
    this.logger.log(
      `Moving task: ${id} to column: ${moveTaskDto.columnId} by user: ${userId}`
    );

    const task = await this.findOne(id, userId);
    const newColumn = await this.columnService.findOne(
      moveTaskDto.columnId,
      userId
    );

    if (newColumn.boardId !== task.boardId) {
      throw new BadRequestException(
        'Cannot move task to column in different board'
      );
    }

    if (moveTaskDto.position === undefined) {
      const maxPosition = await this.taskRepo
        .createQueryBuilder('task')
        .select('MAX(task.position)', 'max')
        .where('task.columnId = :columnId', { columnId: moveTaskDto.columnId })
        .getRawOne();

      moveTaskDto.position = (maxPosition?.max || 0) + 1;
    }

    let newStatus = task.status;
    const columnName = newColumn.name.toLowerCase();
    if (columnName.includes('todo') || columnName.includes('to do')) {
      newStatus = TaskStatus.TODO;
    } else if (
      columnName.includes('progress') ||
      columnName.includes('doing')
    ) {
      newStatus = TaskStatus.IN_PROGRESS;
    } else if (columnName.includes('review')) {
      newStatus = TaskStatus.REVIEW;
    } else if (columnName.includes('done') || columnName.includes('complete')) {
      newStatus = TaskStatus.DONE;
    }

    task.columnId = moveTaskDto.columnId;
    task.position = moveTaskDto.position;
    task.status = newStatus;

    const updatedTask = await this.taskRepo.save(task);

    this.logger.log(`Task moved: ${updatedTask.id}`);
    return this.findOne(updatedTask.id, userId);
  }

  async assignTask(
    id: string,
    assignTaskDto: AssignTaskDto,
    userId: string
  ): Promise<Task> {
    this.logger.log(
      `Assigning task: ${id} to users: ${assignTaskDto.assigneeIds.join(
        ', '
      )} by user: ${userId}`
    );

    const task = await this.findOne(id, userId);

    const assignees = [];
    for (const assigneeId of assignTaskDto.assigneeIds) {
      const user = await this.userService.findOne(assigneeId);
      assignees.push(user);
    }

    task.assignees = assignees;
    await this.taskRepo.save(task);

    this.logger.log(`Task assigned: ${id}`);
    return this.findOne(id, userId);
  }

  async findUserTasks(userId: string, boardId?: string): Promise<Task[]> {
    this.logger.log(
      `Finding tasks for user: ${userId} in board: ${boardId || 'all'}`
    );

    const queryBuilder = this.taskRepo
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.createdBy', 'createdBy')
      .leftJoinAndSelect('task.column', 'column')
      .leftJoinAndSelect('task.board', 'board')
      .leftJoinAndSelect('task.assignees', 'assignees')
      .leftJoinAndSelect('task.labels', 'labels')
      .where('(task.createdById = :userId OR assignees.id = :userId)', {
        userId
      });

    if (boardId) {
      await this.boardService.findOne(boardId, userId);
      queryBuilder.andWhere('task.boardId = :boardId', { boardId });
    } else {
      const userBoards = await this.boardService.findUserBoards(userId);
      const boardIds = userBoards.map(b => b.id);
      if (boardIds.length === 0) {
        return [];
      }
      queryBuilder.andWhere('task.boardId IN (:...boardIds)', { boardIds });
    }

    const tasks = await queryBuilder
      .orderBy('task.dueDate', 'ASC')
      .addOrderBy('task.priority', 'DESC')
      .addOrderBy('task.updatedAt', 'DESC')
      .getMany();

    this.logger.log(`Found ${tasks.length} tasks for user: ${userId}`);
    return tasks;
  }

  // Replace the updateTaskLabels method with this corrected version:

async updateTaskLabels(
  taskId: string,
  labelIds: string[],
  userId: string
): Promise<Task> {
  this.logger.log(`Updating labels for task: ${taskId} by user: ${userId}`);

  await this.findOne(taskId, userId);

  const taskWithLabels = await this.taskRepo.findOne({
    where: { id: taskId },
    relations: ['labels']
  });

  if (!taskWithLabels) {
    throw new NotFoundException(`Task ${taskId} not found`);
  }

  taskWithLabels.labels = labelIds.map(id => ({ id } as Label));

  await this.taskRepo.save(taskWithLabels);

  this.logger.log(`Task labels updated: ${taskId}`);
  return this.findOne(taskId, userId);
}
}
