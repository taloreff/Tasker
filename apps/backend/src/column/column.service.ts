import { 
  Injectable, 
  Logger, 
  NotFoundException, 
  BadRequestException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Column } from './entities/column.entity';
import { CreateColumnDto } from './dtos/create-column.dto';
import { UpdateColumnDto } from './dtos/update-column.dto';
import { ReorderColumnsDto } from './dtos/reorder-column.dto';
import { BoardService } from '../board/board.service';

@Injectable()
export class ColumnService {
  private readonly logger = new Logger(ColumnService.name);

  constructor(
    @InjectRepository(Column)
    private readonly columnRepo: Repository<Column>,
    private readonly boardService: BoardService,
  ) {}

  async create(createColumnDto: CreateColumnDto, userId: string): Promise<Column> {
    this.logger.log(`Creating column: ${createColumnDto.name} in board: ${createColumnDto.boardId} by user: ${userId}`);
    
    // Verify user has access to board
    await this.boardService.findOne(createColumnDto.boardId, userId);

    // If no position specified, put at the end
    if (createColumnDto.position === undefined) {
      const maxPosition = await this.columnRepo
        .createQueryBuilder('column')
        .select('MAX(column.position)', 'max')
        .where('column.boardId = :boardId', { boardId: createColumnDto.boardId })
        .getRawOne();
      
      createColumnDto.position = (maxPosition?.max || 0) + 1;
    }

    const column = this.columnRepo.create(createColumnDto);
    const savedColumn = await this.columnRepo.save(column);

    this.logger.log(`Column created: ${savedColumn.id}`);
    return savedColumn;
  }

  async findAllByBoard(boardId: string, userId: string): Promise<Column[]> {
    this.logger.log(`Finding columns in board: ${boardId} for user: ${userId}`);
    
    // Verify user has access to board
    await this.boardService.findOne(boardId, userId);

    const columns = await this.columnRepo.find({
      where: { boardId },
      relations: ['board'],
      order: { position: 'ASC' },
    });

    this.logger.log(`Found ${columns.length} columns in board: ${boardId}`);
    return columns;
  }

  async findOne(id: string, userId: string): Promise<Column> {
    this.logger.log(`Finding column: ${id} for user: ${userId}`);
    
    const column = await this.columnRepo.findOne({
      where: { id },
      relations: ['board'],
    });

    if (!column) {
      this.logger.warn(`Column not found: ${id}`);
      throw new NotFoundException(`Column ${id} not found`);
    }

    // Check if user has access to the board
    await this.boardService.findOne(column.boardId, userId);

    this.logger.log(`Column found: ${column.name} (ID: ${column.id})`);
    return column;
  }

  async update(id: string, updateColumnDto: UpdateColumnDto, userId: string): Promise<Column> {
    this.logger.log(`Updating column: ${id} by user: ${userId}`);
    
    const column = await this.findOne(id, userId);
    
    // Since we're accessing the column through the board, user already has edit access
    // (BoardService.findOne checks project access which includes edit permissions)

    Object.assign(column, updateColumnDto);
    const updatedColumn = await this.columnRepo.save(column);
    
    this.logger.log(`Column updated: ${updatedColumn.id}`);
    return updatedColumn;
  }

  async remove(id: string, userId: string): Promise<void> {
    this.logger.log(`Soft deleting column: ${id} by user: ${userId}`);
    
    const column = await this.findOne(id, userId);
    
    await this.columnRepo.softDelete(id);
    this.logger.log(`Column soft deleted: ${id}`);
  }

  async reorderColumns(boardId: string, reorderDto: ReorderColumnsDto, userId: string): Promise<Column[]> {
    this.logger.log(`Reordering columns in board: ${boardId} by user: ${userId}`);
    
    // Verify user has access to board
    await this.boardService.findOne(boardId, userId);

    // Validate all column IDs belong to the board
    const columnIds = reorderDto.columns.map(c => c.id);
    const existingColumns = await this.columnRepo.find({
      where: { boardId, id: In(columnIds) },
    });

    if (existingColumns.length !== columnIds.length) {
      this.logger.warn(`Some columns don't belong to board ${boardId}`);
      throw new BadRequestException('Some columns do not belong to this board');
    }

    // Update positions
    const updatePromises = reorderDto.columns.map(columnUpdate =>
      this.columnRepo.update(columnUpdate.id, { position: columnUpdate.position })
    );

    await Promise.all(updatePromises);

    // Return updated columns in order
    const updatedColumns = await this.findAllByBoard(boardId, userId);
    this.logger.log(`Columns reordered in board: ${boardId}`);
    
    return updatedColumns;
  }

  async findUserColumns(userId: string): Promise<Column[]> {
    this.logger.log(`Finding all columns for user: ${userId}`);
    
    // Get all boards user has access to
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

  async createDefaultColumns(boardId: string, userId: string): Promise<Column[]> {
    this.logger.log(`Creating default columns for board: ${boardId}`);
    
    // Verify user has access to board
    await this.boardService.findOne(boardId, userId);

    const defaultColumns = [
      { name: 'To Do', color: '#E53E3E', position: 1 },
      { name: 'In Progress', color: '#DD6B20', position: 2 },
      { name: 'Review', color: '#3182CE', position: 3 },
      { name: 'Done', color: '#38A169', position: 4 },
    ];

    const createdColumns: Column[] = [];
    
    for (const columnData of defaultColumns) {
      const createDto: CreateColumnDto = {
        name: columnData.name,
        boardId,
        position: columnData.position,
        color: columnData.color,
      };
      
      const column = await this.create(createDto, userId);
      createdColumns.push(column);
    }

    this.logger.log(`Created ${createdColumns.length} default columns for board: ${boardId}`);
    return createdColumns;
  }
}