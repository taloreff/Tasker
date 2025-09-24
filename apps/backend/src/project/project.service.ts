import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AssignTeamsDto, AssignMembersDto } from './dto/assign.dto';
import { WorkspaceService } from '../workspace/workspace.service';
import { TeamService } from '../team/team.service';
import { UserService } from '../user/user.service';

@Injectable()
export class ProjectService {
  private readonly logger = new Logger(ProjectService.name);

  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
    private readonly workspaceService: WorkspaceService,
    private readonly teamService: TeamService,
    private readonly userService: UserService
  ) {}

  async create(
    createProjectDto: CreateProjectDto,
    userId: string
  ): Promise<Project> {
    this.logger.log(
      `Creating project: ${createProjectDto.name} in workspace: ${createProjectDto.workspaceId} by user: ${userId}`
    );

    // Verify user has access to workspace
    await this.workspaceService.findOne(createProjectDto.workspaceId, userId);

    const project = this.projectRepo.create({
      ...createProjectDto,
      ownerId: userId
    });

    const savedProject = await this.projectRepo.save(project);
    this.logger.log(`Project created: ${savedProject.id}`);

    return savedProject;
  }

  async findAllByWorkspace(
    workspaceId: string,
    userId: string
  ): Promise<Project[]> {
    this.logger.log(
      `Finding projects in workspace: ${workspaceId} for user: ${userId}`
    );

    // Verify user has access to workspace
    await this.workspaceService.findOne(workspaceId, userId);

    const projects = await this.projectRepo.find({
      where: { workspaceId },
      relations: ['workspace', 'owner', 'teams', 'members']
    });

    this.logger.log(
      `Found ${projects.length} projects in workspace: ${workspaceId}`
    );
    return projects;
  }

  async findOne(id: string, userId: string): Promise<Project> {
    this.logger.log(`Finding project: ${id} for user: ${userId}`);

    const project = await this.projectRepo.findOne({
      where: { id },
      relations: ['workspace', 'owner', 'teams', 'members']
    });

    if (!project) {
      this.logger.error(`Project not found: ${id}`);
      throw new NotFoundException(`Project ${id} not found`);
    }

    // Check if user has access to the workspace
    await this.workspaceService.findOne(project.workspaceId, userId);

    // Additional check: user must be project member, team member, or workspace owner
    await this.checkProjectAccess(project, userId);

    this.logger.log(`Project found: ${project.name} (ID: ${project.id})`);
    return project;
  }

  async update(
    id: string,
    updateProjectDto: UpdateProjectDto,
    userId: string
  ): Promise<Project> {
    this.logger.log(`Updating project: ${id} by user: ${userId}`);

    const project = await this.findOne(id, userId);

    // Check if user is project owner or workspace owner
    await this.checkProjectOwnerAccess(project, userId);

    Object.assign(project, updateProjectDto);
    const updatedProject = await this.projectRepo.save(project);

    this.logger.log(`Project updated: ${updatedProject.id}`);
    return updatedProject;
  }

  async remove(id: string, userId: string): Promise<void> {
    this.logger.log(`Soft deleting project: ${id} by user: ${userId}`);

    const project = await this.findOne(id, userId);

    // Check if user is project owner or workspace owner
    await this.checkProjectOwnerAccess(project, userId);

    await this.projectRepo.softDelete(id);
    this.logger.log(`Project soft deleted: ${id}`);
  }

  async assignTeams(
    projectId: string,
    assignTeamsDto: AssignTeamsDto,
    userId: string
  ): Promise<Project> {
    this.logger.log(
      `Assigning teams to project: ${projectId} by user: ${userId}`
    );

    const project = await this.findOne(projectId, userId);

    // Check if user is project owner or workspace owner
    await this.checkProjectOwnerAccess(project, userId);

    // Verify all teams exist and belong to the same workspace
    const teams = [];
    for (const teamId of assignTeamsDto.teamIds) {
      const team = await this.teamService.findOne(teamId, userId);
      if (team.workspaceId !== project.workspaceId) {
        throw new BadRequestException(
          `Team ${teamId} does not belong to the same workspace as the project`
        );
      }
      teams.push(team);
    }

    project.teams = teams;
    const updatedProject = await this.projectRepo.save(project);

    this.logger.log(`Teams assigned to project: ${projectId}`);
    return updatedProject;
  }

  async assignMembers(
    projectId: string,
    assignMembersDto: AssignMembersDto,
    userId: string
  ): Promise<Project> {
    this.logger.log(
      `Assigning members to project: ${projectId} by user: ${userId}`
    );

    const project = await this.findOne(projectId, userId);

    // Check if user is project owner or workspace owner
    await this.checkProjectOwnerAccess(project, userId);

    // Verify all users exist
    const users = [];
    for (const memberId of assignMembersDto.memberIds) {
      const user = await this.userService.findOne(memberId);
      users.push(user);
    }

    project.members = users;
    const updatedProject = await this.projectRepo.save(project);

    this.logger.log(`Members assigned to project: ${projectId}`);
    return updatedProject;
  }

  async getProjectsByUser(
    userId: string,
    workspaceId?: string
  ): Promise<Project[]> {
    this.logger.log(
      `Finding projects for user: ${userId} in workspace: ${workspaceId ||
        'all'}`
    );

    const queryBuilder = this.projectRepo
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.workspace', 'workspace')
      .leftJoinAndSelect('project.owner', 'owner')
      .leftJoinAndSelect('project.teams', 'teams')
      .leftJoinAndSelect('project.members', 'members')
      .where('project.ownerId = :userId', { userId })
      .orWhere('members.id = :userId', { userId });

    if (workspaceId) {
      queryBuilder.andWhere('project.workspaceId = :workspaceId', {
        workspaceId
      });
    }

    const projects = await queryBuilder.getMany();

    this.logger.log(`Found ${projects.length} projects for user: ${userId}`);
    return projects;
  }

  private async checkProjectAccess(
    project: Project,
    userId: string
  ): Promise<void> {
    // Check if user is workspace owner
    const workspace = await this.workspaceService.findOne(
      project.workspaceId,
      userId
    );
    if (workspace.ownerId === userId) {
      return; // Workspace owner has access
    }

    // Check if user is project owner
    if (project.ownerId === userId) {
      return; // Project owner has access
    }

    // Check if user is project member
    const isMember = project.members?.some(member => member.id === userId);
    if (isMember) {
      return; // Project member has access
    }

    // Check if user is member of any assigned team
    if (project.teams?.length > 0) {
      for (const team of project.teams) {
        try {
          const teamMembers = await this.teamService.getTeamMembers(
            team.id,
            userId
          );
          const isTeamMember = teamMembers.some(
            member => member.userId === userId
          );
          if (isTeamMember) {
            return; // Team member has access
          }
        } catch {
          // Continue checking other teams
        }
      }
    }

    this.logger.error(`User ${userId} denied access to project ${project.id}`);
    throw new ForbiddenException('You do not have access to this project');
  }

  private async checkProjectOwnerAccess(
    project: Project,
    userId: string
  ): Promise<void> {
    // Check if user is workspace owner
    const workspace = await this.workspaceService.findOne(
      project.workspaceId,
      userId
    );
    if (workspace.ownerId === userId) {
      return; // Workspace owner has access
    }

    // Check if user is project owner
    if (project.ownerId === userId) {
      return; // Project owner has access
    }

    this.logger.error(
      `User ${userId} denied owner access to project ${project.id}`
    );
    throw new ForbiddenException(
      'You must be the project owner or workspace owner to perform this action'
    );
  }

  async findUserProjects(
    userId: string,
    workspaceId?: string
  ): Promise<Project[]> {
    this.logger.log(
      `Finding user projects for user: ${userId} in workspace: ${workspaceId ||
        'all'}`
    );

    // Get all projects in the workspace (or all workspaces user has access to)
    let allProjects: Project[] = [];

    if (workspaceId) {
      // Get projects in specific workspace
      try {
        allProjects = await this.findAllByWorkspace(workspaceId, userId);
      } catch {
        // User doesn't have workspace access
        return [];
      }
    } else {
      // Get all workspaces user has access to and their projects
      try {
        const userWorkspaces = await this.workspaceService.findUserWorkspaces(
          userId
        );
        for (const workspace of userWorkspaces) {
          const workspaceProjects = await this.findAllByWorkspace(
            workspace.id,
            userId
          );
          allProjects.push(...workspaceProjects);
        }
      } catch {
        return [];
      }
    }

    // Filter projects user actually has access to
    const accessibleProjects: Project[] = [];
    for (const project of allProjects) {
      try {
        const hasAccess = await this.checkUserProjectAccess(project.id, userId);
        if (hasAccess) {
          accessibleProjects.push(project);
        }
      } catch {
        // Skip projects user doesn't have access to
        continue;
      }
    }

    this.logger.log(
      `Found ${accessibleProjects.length} accessible projects for user: ${userId}`
    );
    return accessibleProjects;
  }

  async checkUserProjectAccess(
    projectId: string,
    userId: string
  ): Promise<boolean> {
    this.logger.log(
      `Checking user project access for project: ${projectId} by user: ${userId}`
    );

    try {
      // Try to find the project with user access - this will throw if no access
      await this.findOne(projectId, userId);
      return true;
    } catch {
      // If findOne throws, user doesn't have access
      return false;
    }
  }

  async checkProjectEditAccess(
    projectId: string,
    userId: string
  ): Promise<void> {
    this.logger.log(
      `Checking edit access for project: ${projectId} by user: ${userId}`
    );

    const project = await this.findOne(projectId, userId);

    // Check if user is project owner
    if (project.ownerId === userId) {
      return;
    }

    // Check if user is workspace owner
    const workspace = await this.workspaceService.findOne(
      project.workspaceId,
      userId
    );
    if (workspace.ownerId === userId) {
      return;
    }

    // For now, we'll allow any project member to edit
    // In the future, you might want more granular permissions
    const hasAccess = await this.checkUserProjectAccess(projectId, userId);
    if (!hasAccess) {
      this.logger.error(
        `User ${userId} denied edit access to project ${projectId}`
      );
      throw new ForbiddenException(
        'You do not have permission to edit this project'
      );
    }
  }
}
