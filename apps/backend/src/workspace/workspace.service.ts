import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workspace } from './entities/workspace.entity';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';

@Injectable()
export class WorkspaceService {
  private readonly logger = new Logger(WorkspaceService.name);

  constructor(
    @InjectRepository(Workspace)
    private readonly workspaceRepo: Repository<Workspace>,
  ) {}

  async create(createWorkspaceDto: CreateWorkspaceDto, ownerId: string): Promise<Workspace> {
    this.logger.log(`Creating workspace: ${createWorkspaceDto.name} for user: ${ownerId}`);
    
    const workspace = this.workspaceRepo.create({
      ...createWorkspaceDto,
      ownerId,
    });

    const savedWorkspace = await this.workspaceRepo.save(workspace);
    this.logger.log(`Workspace created: ${savedWorkspace.id}`);
    
    return savedWorkspace;
  }

  async findUserWorkspaces(userId: string): Promise<Workspace[]> {
    this.logger.log(`Finding workspaces for user: ${userId}`);
    
    // For now, return workspaces owned by user
    // Later we'll add workspace membership
    const workspaces = await this.workspaceRepo.find({
      where: { ownerId: userId },
      relations: ['owner'],
    });

    this.logger.log(`Found ${workspaces.length} workspaces for user: ${userId}`);
    return workspaces;
  }

  async findOne(id: string, userId: string): Promise<Workspace> {
    this.logger.log(`Finding workspace: ${id} for user: ${userId}`);
    
    const workspace = await this.workspaceRepo.findOne({
      where: { id },
      relations: ['owner'],
    });

    if (!workspace) {
      this.logger.error(`Workspace not found: ${id}`);
      throw new NotFoundException(`Workspace ${id} not found`);
    }

    // Check if user has access (owner for now)
    if (workspace.ownerId !== userId) {
      this.logger.error(`User ${userId} denied access to workspace ${id}`);
      throw new ForbiddenException('Access denied to this workspace');
    }

    this.logger.log(`Workspace found: ${workspace.name} (ID: ${workspace.id})`);
    return workspace;
  }

  async update(id: string, updateWorkspaceDto: UpdateWorkspaceDto, userId: string): Promise<Workspace> {
    this.logger.log(`Updating workspace: ${id} by user: ${userId}`);
    
    const workspace = await this.findOne(id, userId); // This checks access

    Object.assign(workspace, updateWorkspaceDto);
    const updatedWorkspace = await this.workspaceRepo.save(workspace);
    
    this.logger.log(`Workspace updated: ${updatedWorkspace.id}`);
    return updatedWorkspace;
  }

  async remove(id: string, userId: string): Promise<void> {
    this.logger.log(`Soft deleting workspace: ${id} by user: ${userId}`);
    
    const workspace = await this.findOne(id, userId); // This checks access
    
    await this.workspaceRepo.softDelete(id);
    this.logger.log(`Workspace soft deleted: ${id}`);
  }
}