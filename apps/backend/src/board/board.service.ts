import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, In, Repository } from 'typeorm';
import { Board } from './entities/board.entity';
import { WorkspaceService } from '../workspace/workspace.service';
import { CreateBoardDto } from './dtos/create-board.dto';
import { UpdateBoardDto } from './dtos/update-board.dto';
import { ReorderBoardsDto } from './dtos/reorder-board.dto';
import { Group, GroupType } from '../group/entities/group.entity';
import { Task } from './entities';

@Injectable()
export class BoardService {
  private readonly logger = new Logger(BoardService.name);

  constructor(
    @InjectRepository(Board)
    private readonly boardRepo: Repository<Board>,
    @InjectRepository(Group)
    private readonly groupRepo: Repository<Group>,
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
    private readonly workspaceService: WorkspaceService
  ) {}

  async create(createBoardDto: CreateBoardDto, userId: string): Promise<Board> {
    this.logger.log(
      `Creating board: ${createBoardDto.name} in workspace: ${createBoardDto.workspaceId} by user: ${userId}`
    );

    await this.workspaceService.findOne(createBoardDto.workspaceId, userId);

    const board = this.boardRepo.create({
      ...createBoardDto,
      ownerId: userId
    });

    const savedBoard = await this.boardRepo.save(board);
    const defaultStatusGroups: DeepPartial<Group>[] = [
      {
        name: 'todo',
        groupType: GroupType.STATUS,
        color: '#E0D9D9',
        boardId: savedBoard.id
      },
      {
        name: 'in_progress',
        groupType: GroupType.STATUS,
        color: '#3B82F6',
        boardId: savedBoard.id
      },
      {
        name: 'review',
        groupType: GroupType.STATUS,
        color: '#F59E0B',
        boardId: savedBoard.id
      },
      {
        name: 'done',
        groupType: GroupType.STATUS,
        color: '#10B981',
        boardId: savedBoard.id
      },
      {
        name: 'blocked',
        groupType: GroupType.STATUS,
        color: '#EF4444',
        boardId: savedBoard.id
      },
      {
        name: 'cancelled',
        groupType: GroupType.STATUS,
        color: '#9CA3AF',
        boardId: savedBoard.id
      }
    ];

    const defaultPriorityGroups: DeepPartial<Group>[] = [
       {
        name: 'low',
        groupType: GroupType.PRIORITY,
        // blue color
        color: '#0097d7',
        boardId: savedBoard.id
      },
      {
        name: 'medium',
        groupType: GroupType.PRIORITY,
        color: '#F59E0B',
        boardId: savedBoard.id
      },
      {
        name: 'high',
        groupType: GroupType.PRIORITY,
        color: '#EF5656',
        boardId: savedBoard.id
      },
      {
        name: 'urgent',
        groupType: GroupType.PRIORITY,
        color: '#8B0000',
        boardId: savedBoard.id
      }
    ];

    await this.groupRepo.save(defaultStatusGroups);
    await this.groupRepo.save(defaultPriorityGroups);

    this.logger.log(`Board created with default groups: ${savedBoard.id}`);

    return this.findOne(savedBoard.id, userId);
  }

  async findAllByWorkspace(
    workspaceId: string,
    userId: string
  ): Promise<(Board & { taskCount: number })[]> {
    this.logger.log(
      `Finding boards in workspace: ${workspaceId} for user: ${userId}`
    );

    await this.workspaceService.findOne(workspaceId, userId);

    const boards = await this.boardRepo.find({
      where: { workspaceId },
      relations: ['workspace', 'owner', 'assignedTeam'],
      order: { createdAt: 'ASC' }
    });

    if (boards.length === 0) return [];

    const taskCountsRaw = await this.taskRepo
      .createQueryBuilder('task')
      .select('task.boardId', 'boardId')
      .addSelect('COUNT(task.id)', 'count')
      .where('task.boardId IN (:...boardIds)', {
        boardIds: boards.map(b => b.id)
      })
      .groupBy('task.boardId')
      .getRawMany<{ boardId: string; count: string }>();

    const taskCounts = new Map(
      taskCountsRaw.map(r => [r.boardId, Number(r.count)])
    );

    const enrichedBoards = boards.map(board => ({
      ...board,
      taskCount: taskCounts.get(board.id) ?? 0
    }));

    return enrichedBoards;
  }

  async findOne(id: string, userId: string): Promise<Board> {
    this.logger.log(`Finding board: ${id} for user: ${userId}`);

    const board = await this.boardRepo.findOne({
      where: { id },
      relations: ['workspace', 'owner', 'assignedTeam']
    });

    if (!board) {
      this.logger.error(`Board not found: ${id}`);
      throw new NotFoundException(`Board ${id} not found`);
    }

    await this.workspaceService.findOne(board.workspaceId, userId);

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

    Object.assign(board, updateBoardDto);
    const updatedBoard = await this.boardRepo.save(board);

    this.logger.log(`Board updated: ${updatedBoard.id}`);
    return this.findOne(updatedBoard.id, userId);
  }

  async remove(id: string, userId: string): Promise<void> {
    this.logger.log(`Soft deleting board: ${id} by user: ${userId}`);

    await this.findOne(id, userId);

    await this.boardRepo.softDelete(id);
    this.logger.log(`Board soft deleted: ${id}`);
  }

  async findBoardsByIds(
    workspaceId: string,
    boardIds: string[],
    userId: string
  ): Promise<Board[]> {
    this.logger.log(
      `Finding boards by IDs in workspace: ${workspaceId} for user: ${userId}`
    );

    await this.workspaceService.findOne(workspaceId, userId);

    const boards = await this.boardRepo.find({
      where: { workspaceId, id: In(boardIds) }
    });

    this.logger.log(`Found ${boards.length} boards by IDs`);
    return boards;
  }

  async reorderBoards(
    workspaceId: string,
    reorderDto: ReorderBoardsDto,
    userId: string
  ): Promise<Board[]> {
    this.logger.log(
      `Reordering boards in workspace: ${workspaceId} by user: ${userId}`
    );

    await this.workspaceService.findOne(workspaceId, userId);

    this.logger.log(`Board reordering completed for workspace: ${workspaceId}`);
    return this.findAllByWorkspace(workspaceId, userId);
  }

  async findUserBoards(userId: string): Promise<Board[]> {
    this.logger.log(`Finding all boards for user: ${userId}`);

    const userWorkspaces = await this.workspaceService.findUserWorkspaces(
      userId
    );
    const workspaceIds = userWorkspaces.map(w => w.id);

    if (workspaceIds.length === 0) {
      return [];
    }

    const boards = await this.boardRepo.find({
      where: { workspaceId: In(workspaceIds) },
      relations: ['workspace', 'owner', 'assignedTeam'],
      order: { workspace: { name: 'ASC' }, name: 'ASC' }
    });

    this.logger.log(`Found ${boards.length} boards for user: ${userId}`);
    return boards;
  }
}
