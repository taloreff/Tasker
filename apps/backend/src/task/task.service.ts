import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BoardItem, ItemStatus } from './entities/task.entity';
import { CreateTaskDto } from './dtos/create-task.dto';
import { UpdateTaskDto } from './dtos/update-task.dto';
import { MoveTaskDto } from './dtos/move-task.dto';
import { AssignTaskDto } from './dtos/assign-task.dto';
import { BoardService } from '../board/board.service';
import { ColumnService } from '../column/column.service';
import { UserService } from '../user/user.service';
import { WorkspaceService } from '../workspace/workspace.service';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);

  constructor(
    @InjectRepository(BoardItem)
    private readonly taskRepo: Repository<BoardItem>,
    private readonly boardService: BoardService,
    private readonly columnService: ColumnService,
    private readonly userService: UserService,
    private readonly workspaceService: WorkspaceService
  ) {}

  async create(createTaskDto: CreateTaskDto, userId: string): Promise<BoardItem> {
    this.logger.log(
      `Creating task: ${createTaskDto.name || createTaskDto.title} in group: ${createTaskDto.groupId || createTaskDto.columnId} by user: ${userId}`
    );

    await this.boardService.findOne(createTaskDto.boardId, userId);
    const group = await this.columnService.findOne(
      createTaskDto.groupId || createTaskDto.columnId,
      userId
    );

    if (group.boardId !== createTaskDto.boardId) {
      throw new BadRequestException(
        'Group does not belong to the specified board'
      );
    }

    if (createTaskDto.position === undefined) {
      const maxPosition = await this.taskRepo
        .createQueryBuilder('task')
        .select('MAX(task.position)', 'max')
        .where('task.groupId = :groupId', {
          groupId: createTaskDto.groupId || createTaskDto.columnId
        })
        .getRawOne();

      createTaskDto.position = (maxPosition?.max || 0) + 1;
    }

    // Handle single assignee (new structure)
    const assigneeId = createTaskDto.assigneeId || 
                      (createTaskDto.assigneeIds && createTaskDto.assigneeIds.length > 0 ? createTaskDto.assigneeIds[0] : undefined);

    if (assigneeId) {
      await this.userService.findOne(assigneeId);
    }

    const task = this.taskRepo.create({
      name: createTaskDto.name || createTaskDto.title,
      description: createTaskDto.description,
      status: createTaskDto.status,
      priority: createTaskDto.priority,
      groupId: createTaskDto.groupId || createTaskDto.columnId,
      assigneeId: assigneeId,
      position: createTaskDto.position,
      createdById: userId
    });

    const savedTask = await this.taskRepo.save(task);

    this.logger.log(`Task created: ${savedTask.id}`);
    return this.findOne(savedTask.id, userId);
  }

  async findAllByBoard(boardId: string, userId: string): Promise<BoardItem[]> {
    this.logger.log(`Finding tasks in board: ${boardId} for user: ${userId}`);

    await this.boardService.findOne(boardId, userId);

    // Find all groups in the board first
    const groups = await this.columnService.findAllByBoard(boardId, userId);
    const groupIds = groups.map(group => group.id);

    // Find tasks in any of those groups
    const tasks = await this.taskRepo.find({
      where: groupIds.length > 0 ? groupIds.map(groupId => ({ groupId })) : [],
      relations: ['createdBy', 'group', 'assignee'],
      order: { groupId: 'ASC', position: 'ASC' }
    });

    this.logger.log(`Found ${tasks.length} tasks in board: ${boardId}`);
    return tasks;
  }

  async findAllByColumn(columnId: string, userId: string): Promise<BoardItem[]> {
    this.logger.log(`Finding tasks in group: ${columnId} for user: ${userId}`);

    await this.columnService.findOne(columnId, userId);

    const tasks = await this.taskRepo.find({
      where: { groupId: columnId },
      relations: ['createdBy', 'group', 'assignee'],
      order: { position: 'ASC' }
    });

    this.logger.log(`Found ${tasks.length} tasks in group: ${columnId}`);
    return tasks;
  }

  async findOne(id: string, userId: string): Promise<BoardItem> {
    this.logger.log(`Finding task: ${id} for user: ${userId}`);

    const task = await this.taskRepo.findOne({
      where: { id },
      relations: ['createdBy', 'group', 'assignee']
    });

    if (!task) {
      this.logger.error(`Task not found: ${id}`);
      throw new NotFoundException(`Task ${id} not found`);
    }

    // Get the board through the task's group
    const group = await this.columnService.findOne(task.groupId, userId);
    await this.boardService.findOne(group.boardId, userId);

    this.logger.log(`Task found: ${task.name} (ID: ${task.id})`);
    return task;
  }

  async update(
    id: string,
    updateTaskDto: UpdateTaskDto,
    userId: string
  ): Promise<BoardItem> {
    this.logger.log(`Updating task: ${id} by user: ${userId}`);

    const task = await this.findOne(id, userId);

    const newGroupId = updateTaskDto.groupId || updateTaskDto.columnId;
    if (newGroupId && newGroupId !== task.groupId) {
      const newGroup = await this.columnService.findOne(
        newGroupId,
        userId
      );
      // Get current task's board through its group
      const currentGroup = await this.columnService.findOne(task.groupId, userId);
      if (newGroup.boardId !== currentGroup.boardId) {
        throw new BadRequestException(
          'Cannot move task to group in different board'
        );
      }
    }

    const assigneeId = updateTaskDto.assigneeId || 
                      (updateTaskDto.assigneeIds && updateTaskDto.assigneeIds.length > 0 ? updateTaskDto.assigneeIds[0] : undefined);

    if (assigneeId) {
      await this.userService.findOne(assigneeId);
    }

    // Map properties correctly
    const updateData: Partial<BoardItem> = {
      name: updateTaskDto.name || updateTaskDto.title || task.name,
      description: updateTaskDto.description,
      status: updateTaskDto.status,
      priority: updateTaskDto.priority,
      groupId: newGroupId || task.groupId,
      assigneeId: assigneeId,
      position: updateTaskDto.position
    };

    Object.assign(task, updateData);
    const updatedTask = await this.taskRepo.save(task);

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
  ): Promise<BoardItem> {
    this.logger.log(
      `Moving task: ${id} to group: ${moveTaskDto.columnId || moveTaskDto.groupId} by user: ${userId}`
    );

    const task = await this.findOne(id, userId);
    const newGroupId = moveTaskDto.groupId || moveTaskDto.columnId;
    const newGroup = await this.columnService.findOne(
      newGroupId,
      userId
    );

    // Get current task's board through its group
    const currentGroup = await this.columnService.findOne(task.groupId, userId);
    if (newGroup.boardId !== currentGroup.boardId) {
      throw new BadRequestException(
        'Cannot move task to group in different board'
      );
    }

    if (moveTaskDto.position === undefined) {
      const maxPosition = await this.taskRepo
        .createQueryBuilder('task')
        .select('MAX(task.position)', 'max')
        .where('task.groupId = :groupId', {
          groupId: newGroupId
        })
        .getRawOne();

      moveTaskDto.position = (maxPosition?.max || 0) + 1;
    }

    let newStatus = task.status;
    const groupName = newGroup.name.toLowerCase();
    if (groupName.includes('todo') || groupName.includes('to do')) {
      newStatus = ItemStatus.TODO;
    } else if (
      groupName.includes('progress') ||
      groupName.includes('doing')
    ) {
      newStatus = ItemStatus.IN_PROGRESS;
    } else if (groupName.includes('review')) {
      newStatus = ItemStatus.REVIEW;
    } else if (groupName.includes('done') || groupName.includes('complete')) {
      newStatus = ItemStatus.DONE;
    }

    task.groupId = newGroupId;
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
  ): Promise<BoardItem> {
    this.logger.log(
      `Assigning task: ${id} to user: ${assignTaskDto.assigneeIds.join(
        ', '
      )} by user: ${userId}`
    );

    const task = await this.findOne(id, userId);

    // Get the workspace ID from the board through the task's group
    const group = await this.columnService.findOne(task.groupId, userId);
    const board = await this.boardService.findOne(group.boardId, userId);
    const workspaceId = board.workspaceId;

    // Handle single assignee (new structure) - take first assignee
    const assigneeId = assignTaskDto.assigneeIds.length > 0 ? assignTaskDto.assigneeIds[0] : null;
    
    if (assigneeId) {
      // Verify assignee exists and has access to workspace
      await this.userService.findOne(assigneeId);
      const userWorkspaces = await this.workspaceService.findUserWorkspaces(assigneeId);
      const hasAccess = userWorkspaces.some(w => w.id === workspaceId);
      
      if (!hasAccess) {
        throw new BadRequestException(
          `User ${assigneeId} does not have access to this workspace`
        );
      }
    }

    task.assigneeId = assigneeId;
    await this.taskRepo.save(task);

    this.logger.log(`Task assigned: ${id}`);
    return this.findOne(id, userId);
  }

  async findUserTasks(userId: string, boardId?: string): Promise<BoardItem[]> {
    this.logger.log(
      `Finding tasks for user: ${userId} in board: ${boardId || 'all'}`
    );

    const queryBuilder = this.taskRepo
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.createdBy', 'createdBy')
      .leftJoinAndSelect('task.group', 'group')
      .leftJoinAndSelect('task.assignee', 'assignee')
      .where('(task.createdById = :userId OR task.assigneeId = :userId)', {
        userId
      });

    if (boardId) {
      queryBuilder.innerJoin('task.group', 'g').where('g.boardId = :boardId', { boardId });
    } else {
      // Filter by user's workspaces
      const userWorkspaces = await this.workspaceService.findUserWorkspaces(userId);
      const workspaceIds = userWorkspaces.map(w => w.id);
      
      if (workspaceIds.length > 0) {
        queryBuilder
          .innerJoin('task.group', 'g')
          .innerJoin('g.board', 'b')
          .andWhere('b.workspaceId IN (:...workspaceIds)', { workspaceIds });
      }
    }

    const tasks = await queryBuilder
      .orderBy('task.dueDate', 'ASC')
      .addOrderBy('task.priority', 'DESC')
      .addOrderBy('task.updatedAt', 'DESC')
      .getMany();

    this.logger.log(`Found ${tasks.length} tasks for user: ${userId}`);
    return tasks;
  }

    // Note: Labels functionality removed from BoardItem entity
  // Labels are now managed at the workspace level separately
  async updateTaskLabels(
    taskId: string,
    labelIds: string[],
    userId: string
  ): Promise<BoardItem> {
    this.logger.log(`Labels functionality is deprecated for task: ${taskId}`);
    
    // Just return the task without label changes
    return this.findOne(taskId, userId);
  }
}
