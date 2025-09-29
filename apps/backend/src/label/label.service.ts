import { 
  Injectable, 
  Logger, 
  NotFoundException, 
  BadRequestException,
  ConflictException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Label } from './entities/label.entity';
import { CreateLabelDto } from './dtos/create-label.dto';
import { UpdateLabelDto } from './dtos/update-label.dto';
import { AssignLabelsDto } from './dtos/assign-label.dto';
import { WorkspaceService } from '../workspace/workspace.service';
import { TaskService } from '../task/task.service';
import { ColumnService } from '../column/column.service';
import { BoardService } from '../board/board.service';
import { Not } from 'typeorm';

@Injectable()
export class LabelService {
  private readonly logger = new Logger(LabelService.name);

  constructor(
    @InjectRepository(Label)
    private readonly labelRepo: Repository<Label>,
    private readonly workspaceService: WorkspaceService,
    private readonly taskService: TaskService,
    private readonly columnService: ColumnService,
    private readonly boardService: BoardService,
  ) {}

  async create(createLabelDto: CreateLabelDto, userId: string): Promise<Label> {
    this.logger.log(`Creating label: ${createLabelDto.name} in workspace: ${createLabelDto.workspaceId} by user: ${userId}`);
    
    // Verify user has access to workspace
    await this.workspaceService.findOne(createLabelDto.workspaceId, userId);

    // Check if label name already exists in workspace
    const existingLabel = await this.labelRepo.findOne({
      where: { 
        name: createLabelDto.name, 
        workspaceId: createLabelDto.workspaceId 
      },
    });

    if (existingLabel) {
      throw new ConflictException(`Label "${createLabelDto.name}" already exists in this workspace`);
    }

    const label = this.labelRepo.create({
      ...createLabelDto,
      createdById: userId,
    });

    const savedLabel = await this.labelRepo.save(label);
    this.logger.log(`Label created: ${savedLabel.id}`);
    
    return this.findOne(savedLabel.id, userId);
  }

  async findAllByWorkspace(workspaceId: string, userId: string): Promise<Label[]> {
    this.logger.log(`Finding labels in workspace: ${workspaceId} for user: ${userId}`);
    
    // Verify user has access to workspace
    await this.workspaceService.findOne(workspaceId, userId);

    const labels = await this.labelRepo.find({
      where: { workspaceId },
      relations: ['createdBy', 'workspace'],
      order: { name: 'ASC' },
    });

    this.logger.log(`Found ${labels.length} labels in workspace: ${workspaceId}`);
    return labels;
  }

  async findOne(id: string, userId: string): Promise<Label> {
    this.logger.log(`Finding label: ${id} for user: ${userId}`);
    
    const label = await this.labelRepo.findOne({
      where: { id },
      relations: ['createdBy', 'workspace'],
    });

    if (!label) {
      this.logger.error(`Label not found: ${id}`);
      throw new NotFoundException(`Label ${id} not found`);
    }

    // Check if user has access to the workspace
    await this.workspaceService.findOne(label.workspaceId, userId);

    this.logger.log(`Label found: ${label.name} (ID: ${label.id})`);
    return label;
  }

  async update(id: string, updateLabelDto: UpdateLabelDto, userId: string): Promise<Label> {
    this.logger.log(`Updating label: ${id} by user: ${userId}`);
    
    const label = await this.findOne(id, userId);

    // Check if new name conflicts with existing labels
    if (updateLabelDto.name && updateLabelDto.name !== label.name) {
      const existingLabel = await this.labelRepo.findOne({
        where: { 
          name: updateLabelDto.name, 
          workspaceId: label.workspaceId,
          id: Not(id), // Exclude current label
        },
      });

      if (existingLabel) {
        throw new ConflictException(`Label "${updateLabelDto.name}" already exists in this workspace`);
      }
    }

    Object.assign(label, updateLabelDto);
    const updatedLabel = await this.labelRepo.save(label);
    
    this.logger.log(`Label updated: ${updatedLabel.id}`);
    return this.findOne(updatedLabel.id, userId);
  }

  async remove(id: string, userId: string): Promise<void> {
    this.logger.log(`Soft deleting label: ${id} by user: ${userId}`);
    
    await this.findOne(id, userId);
    
    await this.labelRepo.softDelete(id);
    this.logger.log(`Label soft deleted: ${id}`);
  }

  async assignLabelsToTask(taskId: string, assignLabelsDto: AssignLabelsDto, userId: string): Promise<void> {
    this.logger.log(`Assigning labels to task: ${taskId} by user: ${userId}`);
    
    const task = await this.taskService.findOne(taskId, userId);

    const group = await this.columnService.findOne(task.groupId, userId);
    const board = await this.boardService.findOne(group.boardId, userId);
    const taskWorkspaceId = board.workspaceId;

    const labels = await this.labelRepo.find({
      where: { id: In(assignLabelsDto.labelIds) },
      relations: ['workspace'],
    });

    if (labels.length !== assignLabelsDto.labelIds.length) {
      throw new BadRequestException('Some labels were not found');
    }

    // Check if all labels belong to the task's workspace
    const invalidLabels = labels.filter(label => label.workspaceId !== taskWorkspaceId);
    
    if (invalidLabels.length > 0) {
      throw new BadRequestException('Some labels do not belong to the task\'s workspace');
    }

    // Note: Labels are no longer directly assigned to tasks in the new structure
    // This method is deprecated but kept for backward compatibility
    this.logger.log(`Label assignment deprecated for task: ${taskId}`);
  }

  async findUserLabels(userId: string): Promise<Label[]> {
    this.logger.log(`Finding all labels for user: ${userId}`);
    
    // Get all workspaces user has access to
    const userWorkspaces = await this.workspaceService.findUserWorkspaces(userId);
    const workspaceIds = userWorkspaces.map(w => w.id);

    if (workspaceIds.length === 0) {
      return [];
    }

    const labels = await this.labelRepo.find({
      where: { workspaceId: In(workspaceIds) },
      relations: ['createdBy', 'workspace'],
      order: { workspace: { name: 'ASC' }, name: 'ASC' },
    });

    this.logger.log(`Found ${labels.length} labels for user: ${userId}`);
    return labels;
  }

  async findLabelsByTask(taskId: string, userId: string): Promise<Label[]> {
    this.logger.log(`Finding labels for task: ${taskId}`);
    
    // Verify user has access to task
    await this.taskService.findOne(taskId, userId);

    // Note: Labels are no longer directly linked to tasks in the new structure
    // Return empty array for backward compatibility
    this.logger.log(`Labels no longer linked to tasks directly`);
    return [];
  }

  async createDefaultLabels(workspaceId: string, userId: string): Promise<Label[]> {
    this.logger.log(`Creating default labels for workspace: ${workspaceId}`);
    
    // Verify user has access to workspace
    await this.workspaceService.findOne(workspaceId, userId);

    const defaultLabels = [
      { name: 'Bug', color: '#E53E3E', description: 'Issues and bugs that need to be fixed' },
      { name: 'Feature', color: '#3182CE', description: 'New features and enhancements' },
      { name: 'Urgent', color: '#DD6B20', description: 'High priority items that need immediate attention' },
      { name: 'Research', color: '#805AD5', description: 'Investigation and research tasks' },
      { name: 'Documentation', color: '#38A169', description: 'Documentation related tasks' },
      { name: 'Testing', color: '#D69E2E', description: 'Quality assurance and testing tasks' },
    ];

    const createdLabels: Label[] = [];
    
    for (const labelData of defaultLabels) {
      try {
        const createDto: CreateLabelDto = {
          name: labelData.name,
          color: labelData.color,
          description: labelData.description,
          workspaceId,
        };
        
        const label = await this.create(createDto, userId);
        createdLabels.push(label);
      } catch (error) {
        // Skip if label already exists
        if (error instanceof ConflictException) {
          this.logger.log(`Label "${labelData.name}" already exists, skipping`);
        } else {
          throw error;
        }
      }
    }

    this.logger.log(`Created ${createdLabels.length} default labels for workspace: ${workspaceId}`);
    return createdLabels;
  }
}
