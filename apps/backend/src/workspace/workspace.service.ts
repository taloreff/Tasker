import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workspace } from './entities/workspace.entity';
import { WorkspaceMember, WorkspaceMemberRole } from '../user/entities/workspace-member.entity';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';

@Injectable()
export class WorkspaceService {
  private readonly logger = new Logger(WorkspaceService.name);

  constructor(
    @InjectRepository(Workspace)
    private readonly workspaceRepo: Repository<Workspace>,
    @InjectRepository(WorkspaceMember)
    private readonly workspaceMemberRepo: Repository<WorkspaceMember>,
  ) {}

  async create(createWorkspaceDto: CreateWorkspaceDto, ownerId: string): Promise<Workspace> {
    this.logger.log(`Creating workspace: ${createWorkspaceDto.name} for user: ${ownerId}`);
    
    const workspace = this.workspaceRepo.create({
      ...createWorkspaceDto,
      ownerId,
    });

    const savedWorkspace = await this.workspaceRepo.save(workspace);
    
    // Automatically add the creator as an owner member
    const ownerMember = this.workspaceMemberRepo.create({
      workspaceId: savedWorkspace.id,
      userId: ownerId,
      role: WorkspaceMemberRole.OWNER,
      joinedAt: new Date(),
    });
    
    await this.workspaceMemberRepo.save(ownerMember);
    
    this.logger.log(`Workspace created: ${savedWorkspace.id}`);
    
    return savedWorkspace;
  }

  async findUserWorkspaces(userId: string): Promise<Workspace[]> {
    this.logger.log(`Finding workspaces for user: ${userId}`);
    
    // Find workspaces where the user is a member
    const membershipQuery = this.workspaceMemberRepo
      .createQueryBuilder('wm')
      .leftJoinAndSelect('wm.workspace', 'workspace')
      .leftJoinAndSelect('workspace.owner', 'owner')
      .where('wm.userId = :userId', { userId })
      .andWhere('wm.isActive = :isActive', { isActive: true });

    const memberships = await membershipQuery.getMany();
    const workspaces = memberships.map(membership => membership.workspace);

    this.logger.log(`Found ${workspaces.length} workspaces for user: ${userId}`);
    return workspaces;
  }

  async findOne(id: string, userId: string): Promise<Workspace> {
    this.logger.log(`Finding workspace: ${id} for user: ${userId}`);
    
    const workspace = await this.workspaceRepo.findOne({
      where: { id },
      relations: ['owner', 'members', 'members.user'],
    });

    if (!workspace) {
      this.logger.error(`Workspace not found: ${id}`);
      throw new NotFoundException(`Workspace ${id} not found`);
    }

    // Check if user has access through membership
    const hasAccess = workspace.members.some(
      member => member.userId === userId && member.isActive
    );

    if (!hasAccess) {
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
    
    await this.findOne(id, userId); // This checks access
    
    await this.workspaceRepo.softDelete(id);
    this.logger.log(`Workspace soft deleted: ${id}`);
  }

  async addMember(workspaceId: string, userId: string, role: WorkspaceMemberRole = WorkspaceMemberRole.MEMBER): Promise<WorkspaceMember> {
    this.logger.log(`Adding member ${userId} to workspace ${workspaceId} with role ${role}`);
    
    const existingMember = await this.workspaceMemberRepo.findOne({
      where: { workspaceId, userId },
    });

    if (existingMember) {
      if (existingMember.isActive) {
        throw new ForbiddenException('User is already a member of this workspace');
      }
      // Reactivate existing member
      existingMember.isActive = true;
      existingMember.role = role;
      existingMember.joinedAt = new Date();
      return await this.workspaceMemberRepo.save(existingMember);
    }

    const member = this.workspaceMemberRepo.create({
      workspaceId,
      userId,
      role,
      joinedAt: new Date(),
    });

    return await this.workspaceMemberRepo.save(member);
  }

  async removeMember(workspaceId: string, userId: string, requesterId: string): Promise<void> {
    this.logger.log(`Removing member ${userId} from workspace ${workspaceId} by ${requesterId}`);
    
    // Check if requester has permission (must be owner or admin)
    const requesterMembership = await this.workspaceMemberRepo.findOne({
      where: { workspaceId, userId: requesterId },
    });

    if (!requesterMembership || ![WorkspaceMemberRole.OWNER, WorkspaceMemberRole.ADMIN].includes(requesterMembership.role)) {
      throw new ForbiddenException('Insufficient permissions to remove members');
    }

    const member = await this.workspaceMemberRepo.findOne({
      where: { workspaceId, userId },
    });

    if (!member) {
      throw new NotFoundException('Member not found in workspace');
    }

    // Soft delete by setting isActive to false
    member.isActive = false;
    await this.workspaceMemberRepo.save(member);
  }

  async getWorkspaceMember(workspaceId: string, userId: string): Promise<WorkspaceMember> {
    this.logger.log(`Getting workspace member: ${userId} from workspace: ${workspaceId}`);
    
    const member = await this.workspaceMemberRepo.findOne({
      where: { workspaceId, userId, isActive: true },
    });

    if (!member) {
      throw new NotFoundException('Member not found in workspace');
    }

    return member;
  }
}