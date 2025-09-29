import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { BoardGroup } from './entities/column.entity';
import { CreateColumnDto } from './dtos/create-column.dto';
import { UpdateColumnDto } from './dtos/update-column.dto';
import { ReorderColumnsDto } from './dtos/reorder-column.dto';
import { BoardService } from '../board/board.service';

@Injectable()
export class ColumnService {
  private readonly logger = new Logger(ColumnService.name);

  constructor(
    @InjectRepository(BoardGroup)
    private readonly columnRepo: Repository<BoardGroup>,
    private readonly boardService: BoardService
  ) {}

  async create(
    createColumnDto: CreateColumnDto,
    userId: string
  ): Promise<BoardGroup> {
    this.logger.log(
      `Creating column: ${createColumnDto.name} in board: ${createColumnDto.boardId} by user: ${userId}`
    );

    await this.boardService.findOne(createColumnDto.boardId, userId);

    if (createColumnDto.position === undefined) {
      const maxPosition = await this.columnRepo
        .createQueryBuilder('column')
        .select('MAX(column.position)', 'max')
        .where('column.boardId = :boardId', {
          boardId: createColumnDto.boardId
        })
        .getRawOne();

      createColumnDto.position = (maxPosition?.max || 0) + 1;
    }

    const column = this.columnRepo.create(createColumnDto);
    const savedBoardGroup = await this.columnRepo.save(column);

    this.logger.log(`BoardGroup created: ${savedBoardGroup.id}`);
    return savedBoardGroup;
  }

  async findAllByBoard(boardId: string, userId: string): Promise<BoardGroup[]> {
    this.logger.log(`Finding columns in board: ${boardId} for user: ${userId}`);

    await this.boardService.findOne(boardId, userId);

    const columns = await this.columnRepo.find({
      where: { boardId },
      relations: ['board'],
      order: { position: 'ASC' }
    });

    this.logger.log(`Found ${columns.length} columns in board: ${boardId}`);
    return columns;
  }

  async findOne(id: string, userId: string): Promise<BoardGroup> {
    this.logger.log(`Finding column: ${id} for user: ${userId}`);

    const column = await this.columnRepo.findOne({
      where: { id },
      relations: ['board']
    });

    if (!column) {
      this.logger.error(`BoardGroup not found: ${id}`);
      throw new NotFoundException(`BoardGroup ${id} not found`);
    }

    await this.boardService.findOne(column.boardId, userId);

    this.logger.log(`BoardGroup found: ${column.name} (ID: ${column.id})`);
    return column;
  }

  async update(
    id: string,
    updateColumnDto: UpdateColumnDto,
    userId: string
  ): Promise<BoardGroup> {
    this.logger.log(`Updating column: ${id} by user: ${userId}`);

    const column = await this.findOne(id, userId);

    Object.assign(column, updateColumnDto);
    const updatedBoardGroup = await this.columnRepo.save(column);

    this.logger.log(`BoardGroup updated: ${updatedBoardGroup.id}`);
    return updatedBoardGroup;
  }

  async remove(id: string, userId: string): Promise<void> {
    this.logger.log(`Soft deleting column: ${id} by user: ${userId}`);

    await this.findOne(id, userId);

    await this.columnRepo.softDelete(id);
    this.logger.log(`BoardGroup soft deleted: ${id}`);
  }

  async reorderColumns(
    boardId: string,
    reorderDto: ReorderColumnsDto,
    userId: string
  ): Promise<BoardGroup[]> {
    this.logger.log(
      `Reordering columns in board: ${boardId} by user: ${userId}`
    );

    await this.boardService.findOne(boardId, userId);

    const columnIds = reorderDto.columns.map(c => c.id);
    const existingBoardGroups = await this.columnRepo.find({
      where: { boardId, id: In(columnIds) }
    });

    if (existingBoardGroups.length !== columnIds.length) {
      this.logger.error(`Some columns don't belong to board ${boardId}`);
      throw new BadRequestException('Some columns do not belong to this board');
    }

    const updatePromises = reorderDto.columns.map(columnUpdate =>
      this.columnRepo.update(columnUpdate.id, {
        position: columnUpdate.position
      })
    );

    await Promise.all(updatePromises);

    const updatedBoardGroups = await this.findAllByBoard(boardId, userId);
    this.logger.log(`BoardGroups reordered in board: ${boardId}`);

    return updatedBoardGroups;
  }

  async findUserBoardGroups(userId: string): Promise<BoardGroup[]> {
    this.logger.log(`Finding all columns for user: ${userId}`);

    const userBoards = await this.boardService.findUserBoards(userId);
    const boardIds = userBoards.map(b => b.id);

    if (boardIds.length === 0) {
      return [];
    }

    const columns = await this.columnRepo
      .createQueryBuilder('column')
      .leftJoinAndSelect('column.board', 'board')
      .leftJoinAndSelect('board.project', 'project')
      .where('column.boardId IN (:...boardIds)', { boardIds })
      .orderBy('project.name', 'ASC')
      .addOrderBy('board.name', 'ASC')
      .addOrderBy('column.position', 'ASC')
      .getMany();

    this.logger.log(`Found ${columns.length} columns for user: ${userId}`);
    return columns;
  }

  async createDefaultBoardGroups(
    boardId: string,
    userId: string
  ): Promise<BoardGroup[]> {
    this.logger.log(`Creating default columns for board: ${boardId}`);

    await this.boardService.findOne(boardId, userId);

    const defaultBoardGroups = [
      { name: 'To Do', color: '#E53E3E', position: 1 },
      { name: 'In Progress', color: '#DD6B20', position: 2 },
      { name: 'Review', color: '#3182CE', position: 3 },
      { name: 'Done', color: '#38A169', position: 4 }
    ];

    const createdBoardGroups: BoardGroup[] = [];

    for (const columnData of defaultBoardGroups) {
      const createDto: CreateColumnDto = {
        name: columnData.name,
        boardId,
        position: columnData.position,
        color: columnData.color
      };

      const column = await this.create(createDto, userId);
      createdBoardGroups.push(column);
    }

    this.logger.log(
      `Created ${createdBoardGroups.length} default columns for board: ${boardId}`
    );
    return createdBoardGroups;
  }
}
