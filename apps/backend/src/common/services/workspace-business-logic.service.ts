import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { WorkspaceService } from '../../workspace/workspace.service';
import { UserService } from '../../user/user.service';
import { WorkspaceMemberRole } from '../../user/entities/workspace-member.entity';

@Injectable()
export class WorkspaceBusinessLogicService {
  constructor(
    private readonly workspaceService: WorkspaceService,
    private readonly userService: UserService,
  ) {}

  /**
   * Validates that a user is a member of a workspace with sufficient permissions
   */
  async validateWorkspaceMembership(
    workspaceId: string,
    userId: string,
    requiredRole?: WorkspaceMemberRole,
  ): Promise<void> {
    try {
      const workspace = await this.workspaceService.findOne(workspaceId, userId);
      
      // If a specific role is required, check the user's role
      if (requiredRole) {
        const member = await this.workspaceService.getWorkspaceMember(workspaceId, userId);
        
        const roleHierarchy = [
          WorkspaceMemberRole.VIEWER,
          WorkspaceMemberRole.MEMBER,
          WorkspaceMemberRole.ADMIN,
          WorkspaceMemberRole.OWNER,
        ];
        
        const userRoleIndex = roleHierarchy.indexOf(member.role);
        const requiredRoleIndex = roleHierarchy.indexOf(requiredRole);
        
        if (userRoleIndex < requiredRoleIndex) {
          throw new ForbiddenException(`Insufficient permissions. Required role: ${requiredRole}`);
        }
      }
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException('User must be a workspace member to perform this action');
    }
  }

  /**
   * Validates that multiple users are all workspace members
   */
  async validateMultipleWorkspaceMemberships(
    workspaceId: string,
    userIds: string[],
  ): Promise<void> {
    for (const userId of userIds) {
      await this.validateWorkspaceMembership(workspaceId, userId);
    }
  }

  /**
   * Checks if a user can manage workspace members (add/remove)
   */
  async canManageWorkspaceMembers(workspaceId: string, userId: string): Promise<boolean> {
    try {
      await this.validateWorkspaceMembership(workspaceId, userId, WorkspaceMemberRole.ADMIN);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Checks if a user can manage teams within a workspace
   */
  async canManageTeams(workspaceId: string, userId: string): Promise<boolean> {
    try {
      await this.validateWorkspaceMembership(workspaceId, userId, WorkspaceMemberRole.MEMBER);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Gets workspace hierarchy information for a user
   */
  async getWorkspaceHierarchyInfo(userId: string) {
    const workspaces = await this.workspaceService.findUserWorkspaces(userId);
    
    const hierarchy = [];
    for (const workspace of workspaces) {
      const member = await this.workspaceService.getWorkspaceMember(workspace.id, userId);
      
      hierarchy.push({
        workspace: {
          id: workspace.id,
          name: workspace.name,
          description: workspace.description,
          color: workspace.color,
        },
        membershipInfo: {
          role: member.role,
          joinedAt: member.joinedAt,
          isActive: member.isActive,
        },
        permissions: {
          canManageMembers: [WorkspaceMemberRole.ADMIN, WorkspaceMemberRole.OWNER].includes(member.role),
          canManageTeams: member.role !== WorkspaceMemberRole.VIEWER,
          canCreateProjects: member.role !== WorkspaceMemberRole.VIEWER,
          canManageWorkspace: member.role === WorkspaceMemberRole.OWNER,
        },
      });
    }
    
    return hierarchy;
  }
}