import {
  Injectable,
  Logger,
  NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Board } from './entities/board.entity';
import { WorkspaceService } from '../workspace/workspace.service';
import { CreateBoardDto } from './dtos/create-board.dto';
import { UpdateBoardDto } from './dtos/update-board.dto';
import { ReorderBoardsDto } from './dtos/reorder-board.dto';

@Injectable()
export class BoardService {
  private readonly logger = new Logger(BoardService.name);

  constructor(
    @InjectRepository(Board)
    private readonly boardRepo: Repository<Board>,
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
    this.logger.log(`Board created: ${savedBoard.id}`);

    return this.findOne(savedBoard.id, userId);
  }

  async findAllByWorkspace(workspaceId: string, userId: string): Promise<Board[]> {
    this.logger.log(
      `Finding boards in workspace: ${workspaceId} for user: ${userId}`
    );

    await this.workspaceService.findOne(workspaceId, userId);

    const boards = await this.boardRepo.find({
      where: { workspaceId },
      relations: ['workspace', 'owner', 'assignedTeam'],
      order: { createdAt: 'ASC' }
    });

    this.logger.log(`Found ${boards.length} boards in workspace: ${workspaceId}`);
    return boards;
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

  async update(id: string, updateBoardDto: UpdateBoardDto, userId: string): Promise<Board> {
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

  async findBoardsByIds(workspaceId: string, boardIds: string[], userId: string): Promise<Board[]> {
    this.logger.log(`Finding boards by IDs in workspace: ${workspaceId} for user: ${userId}`);

    await this.workspaceService.findOne(workspaceId, userId);

    const boards = await this.boardRepo.find({
      where: { workspaceId, id: In(boardIds) }
    });

    this.logger.log(`Found ${boards.length} boards by IDs`);
    return boards;
  }

  async reorderBoards(workspaceId: string, reorderDto: ReorderBoardsDto, userId: string): Promise<Board[]> {
    this.logger.log(`Reordering boards in workspace: ${workspaceId} by user: ${userId}`);

    await this.workspaceService.findOne(workspaceId, userId);


    this.logger.log(`Board reordering completed for workspace: ${workspaceId}`);
    return this.findAllByWorkspace(workspaceId, userId);
  }

  async findUserBoards(userId: string): Promise<Board[]> {
    this.logger.log(`Finding all boards for user: ${userId}`);

    const userWorkspaces = await this.workspaceService.findUserWorkspaces(userId);
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
