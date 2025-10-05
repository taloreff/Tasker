import { 
  Injectable, 
  Logger, 
  NotFoundException, 
  ForbiddenException,
  BadRequestException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './entities/team.entity';
import { WorkspaceService } from '../workspace/workspace.service';
import { UserService } from '../user/user.service';
import { TeamRole, UserTeamRole } from './entities/user_team_role.entity';
import { CreateTeamDto } from './dtos/create-team.dto';
import { UpdateTeamDto } from './dtos/update-team.dto';
import { AddTeamMemberDto } from './dtos/add-team-member.dto';

@Injectable()
export class TeamService {
  private readonly logger = new Logger(TeamService.name);

  constructor(
    @InjectRepository(Team)
    private readonly teamRepo: Repository<Team>,
    @InjectRepository(UserTeamRole)
    private readonly userTeamRoleRepo: Repository<UserTeamRole>,
    private readonly workspaceService: WorkspaceService,
    private readonly userService: UserService,
  ) {}

  async create(createTeamDto: CreateTeamDto, userId: string): Promise<Team> {
    this.logger.log(`Creating team: ${createTeamDto.name} in workspace: ${createTeamDto.workspaceId} by user: ${userId}`);
    
    await this.workspaceService.findOne(createTeamDto.workspaceId, userId);

    const team = this.teamRepo.create(createTeamDto);
    const savedTeam = await this.teamRepo.save(team);

    await this.addMember(savedTeam.id, { userId, role: TeamRole.TEAM_ADMIN }, userId);

    this.logger.log(`Team created: ${savedTeam.id}`);
    return savedTeam;
  }

  async findAllByWorkspace(workspaceId: string, userId: string): Promise<Team[]> {
    this.logger.log(`Finding teams in workspace: ${workspaceId} for user: ${userId}`);
    
    await this.workspaceService.findOne(workspaceId, userId);

    const teams = await this.teamRepo.find({
      where: { workspaceId },
      relations: ['workspace'],
    });

    this.logger.log(`Found ${teams.length} teams in workspace: ${workspaceId}`);
    return teams;
  }

  async findOne(id: string, userId: string): Promise<Team> {
    this.logger.log(`Finding team: ${id} for user: ${userId}`);
    
    const team = await this.teamRepo.findOne({
      where: { id },
      relations: ['workspace'],
    });

    if (!team) {
      this.logger.error(`Team not found: ${id}`);
      throw new NotFoundException(`Team ${id} not found`);
    }

    await this.workspaceService.findOne(team.workspaceId, userId);

    this.logger.log(`Team found: ${team.name} (ID: ${team.id})`);
    return team;
  }

  async update(id: string, updateTeamDto: UpdateTeamDto, userId: string): Promise<Team> {
    this.logger.log(`Updating team: ${id} by user: ${userId}`);
    
    const team = await this.findOne(id, userId);
    
    await this.checkTeamAdminAccess(id, userId);

    Object.assign(team, updateTeamDto);
    const updatedTeam = await this.teamRepo.save(team);
    
    this.logger.log(`Team updated: ${updatedTeam.id}`);
    return updatedTeam;
  }

  async remove(id: string, userId: string): Promise<void> {
    this.logger.log(`Soft deleting team: ${id} by user: ${userId}`);
    
    const team = await this.findOne(id, userId);
    
    await this.checkTeamAdminAccess(id, userId);
    
    await this.teamRepo.softDelete(id);
    this.logger.log(`Team soft deleted: ${id}`);
  }

  async addMember(teamId: string, addMemberDto: AddTeamMemberDto, requesterId: string): Promise<UserTeamRole> {
    this.logger.log(`Adding member ${addMemberDto.userId} to team: ${teamId} by user: ${requesterId}`);
    
    const team = await this.findOne(teamId, requesterId);
    
    await this.checkTeamAdminAccess(teamId, requesterId);

    await this.userService.findOne(addMemberDto.userId);

    try {
      await this.workspaceService.findOne(team.workspaceId, addMemberDto.userId);
    } catch (error) {
      this.logger.error(`User ${addMemberDto.userId} is not a member of workspace ${team.workspaceId}`);
      throw new BadRequestException('User must be a workspace member before joining a team');
    }

    const existingMembership = await this.userTeamRoleRepo.findOne({
      where: { teamId, userId: addMemberDto.userId },
    });

    if (existingMembership) {
      this.logger.error(`User ${addMemberDto.userId} is already a member of team ${teamId}`);
      throw new BadRequestException('User is already a member of this team');
    }

    const membership = this.userTeamRoleRepo.create({
      teamId,
      userId: addMemberDto.userId,
      role: addMemberDto.role || TeamRole.TEAM_MEMBER,
    });

    const savedMembership = await this.userTeamRoleRepo.save(membership);
    this.logger.log(`Member added to team: ${teamId}`);
    
    return savedMembership;
  }

  async removeMember(teamId: string, userId: string, requesterId: string): Promise<void> {
    this.logger.log(`Removing member ${userId} from team: ${teamId} by user: ${requesterId}`);
    
    await this.findOne(teamId, requesterId);
    
    if (userId !== requesterId) {
      await this.checkTeamAdminAccess(teamId, requesterId);
    }

    const membership = await this.userTeamRoleRepo.findOne({
      where: { teamId, userId },
    });

    if (!membership) {
      this.logger.error(`User ${userId} is not a member of team ${teamId}`);
      throw new NotFoundException('User is not a member of this team');
    }

    await this.userTeamRoleRepo.delete(membership.id);
    this.logger.log(`Member removed from team: ${teamId}`);
  }

  async getTeamMembers(teamId: string, userId: string): Promise<UserTeamRole[]> {
    this.logger.log(`Getting members for team: ${teamId} by user: ${userId}`);
    
    await this.findOne(teamId, userId);

    const members = await this.userTeamRoleRepo.find({
      where: { teamId },
      relations: ['user', 'team'],
    });

    this.logger.log(`Found ${members.length} members in team: ${teamId}`);
    return members;
  }

  private async checkTeamAdminAccess(teamId: string, userId: string): Promise<void> {
    const team = await this.findOne(teamId, userId);
    
    const workspace = await this.workspaceService.findOne(team.workspaceId, userId);
    if (workspace.ownerId === userId) {
      return;
    }

    const membership = await this.userTeamRoleRepo.findOne({
      where: { teamId, userId, role: TeamRole.TEAM_ADMIN },
    });

    if (!membership) {
      this.logger.error(`User ${userId} denied admin access to team ${teamId}`);
      throw new ForbiddenException('You must be a team admin or workspace owner to perform this action');
    }
  }
}