import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { UnauthorizedError } from '@esg/shared-kernel';
import type { ITenantContext } from '@esg/shared-kernel';

/**
 * Guard that ensures a valid tenant context exists.
 * Apply to routes that require authentication.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly cls: ClsService) {}

  canActivate(_context: ExecutionContext): boolean {
    const ctx = this.cls.get<ITenantContext>('tenantContext');
    if (!ctx) {
      throw new UnauthorizedError('Authentication required. Provide X-Tenant-Id header.');
    }
    return true;
  }
}
