import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    SetMetadata,
    Logger,
  } from '@nestjs/common';
  import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

  
  @Injectable()
  export class RolesGuard implements CanActivate {
    private readonly logger = new Logger(RolesGuard.name);

    constructor(private reflector: Reflector) {}
  
    canActivate(context: ExecutionContext): boolean {
      const requiredRoles = this.reflector.getAllAndOverride<string[]>(
        ROLES_KEY,
        [context.getHandler(), context.getClass()],
      );
      
      this.logger.log(`Required roles: ${requiredRoles || 'none'}`);
      
      if (!requiredRoles) {
        this.logger.log('No roles required, allowing access');
        return true; // no roles required
      }
  
      const { user } = context.switchToHttp().getRequest();
      if (!user) {
        this.logger.error('No user in request');
        throw new ForbiddenException('No user in request');
      }
  
      const userRoles = user.roles?.map(r => r.name) || [];
      this.logger.log(`User roles: ${userRoles.join(', ')}, Required: ${requiredRoles.join(', ')}`);
      
      const hasRole = user.roles?.some((r) => requiredRoles.includes(r.name));
      if (!hasRole) {
        this.logger.error(`User ${user.email} does not have required roles`);
        throw new ForbiddenException('You do not have permission');
      }
  
      this.logger.log(`User ${user.email} has required role, allowing access`);
      return true;
    }
  }

  