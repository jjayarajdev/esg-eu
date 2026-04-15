import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ClsService } from 'nestjs-cls';
import { ForbiddenError } from '@esg/shared-kernel';
import type { UserRole, ITenantContext } from '@esg/shared-kernel';
import { ROLES_KEY } from './roles.decorator';

/**
 * Guard that checks if the current user has the required roles.
 * Used with @Roles() decorator.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly cls: ClsService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // No roles required — allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const ctx = this.cls.get<ITenantContext>('tenantContext');
    if (!ctx) {
      throw new ForbiddenError('No tenant context available.');
    }

    const hasRole = requiredRoles.some((role) =>
      ctx.userRoles.includes(role),
    );

    if (!hasRole) {
      throw new ForbiddenError(
        `Required roles: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
