import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { WorkspaceService } from '../../workspace/workspace.service';

@Injectable()
export class WorkspaceMemberGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private workspaceService: WorkspaceService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const workspaceId = request.params.workspaceId || request.params.id;
    
    if (!workspaceId) {
      return true;
    }

    try {
      await this.workspaceService.findOne(workspaceId, user.id);
      return true;
    } catch (error) {
      throw new ForbiddenException('Access denied. You must be a workspace member to perform this action.');
    }
  }
}