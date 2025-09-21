import { CanActivate, ExecutionContext, ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { OWNER_OR_ADMIN_KEY } from '../decorators/owneradmin.decorator';

@Injectable()
export class OwnerOrAdminGuard implements CanActivate {
  private readonly logger = new Logger(OwnerOrAdminGuard.name);
  
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const requiresOwnerOrAdmin = this.reflector.getAllAndOverride<boolean>(
      OWNER_OR_ADMIN_KEY,
      [ctx.getHandler(), ctx.getClass()],
    );

    this.logger.log(`[OwnerOrAdminGuard] requiresOwnerOrAdmin: ${requiresOwnerOrAdmin}`);

    if (!requiresOwnerOrAdmin) {
      this.logger.log('[OwnerOrAdminGuard] No decorator found, allowing access');
      return true;
    }

    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    const { id } = request.params;


    if (!user) {
      this.logger.log('[OwnerOrAdminGuard] No user found');
      throw new ForbiddenException('No user on request');
    }

    const isAdmin = user.roles?.some((r) => r.name === 'ADMIN');
    const isOwner = user.id === id;

    if (isAdmin) {
      return true;
    }
    
    if (isOwner) {
      return true;
    }

    this.logger.error('[OwnerOrAdminGuard] Access denied');
    throw new ForbiddenException('You can only access your own resource');
  }
}
