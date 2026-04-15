import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ClsService } from 'nestjs-cls';
import { DatabaseService } from '../database/database.service';
import type { ITenantContext } from '@esg/shared-kernel';

/**
 * Mock authentication middleware.
 * In development, reads tenant and user info from headers or env defaults.
 * Will be replaced by Auth0/Clerk middleware in production.
 *
 * Headers:
 *   X-Tenant-Id: UUID of the tenant (falls back to DEFAULT_TENANT_ID env)
 *   X-User-Email: email of the user (falls back to DEFAULT_USER_EMAIL env)
 *   X-User-Roles: comma-separated roles (falls back to 'admin')
 */
@Injectable()
export class MockAuthMiddleware implements NestMiddleware {
  constructor(
    private readonly cls: ClsService,
    private readonly db: DatabaseService,
  ) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    const tenantId =
      (req.headers['x-tenant-id'] as string) ||
      process.env.DEFAULT_TENANT_ID;

    // Skip tenant resolution for non-tenant routes (health, tenant creation)
    if (!tenantId) {
      return next();
    }

    // Look up tenant from platform schema
    const result = await this.db.query(
      'SELECT id, name, slug, schema_name, subscription_tier FROM platform.tenants WHERE id = $1 AND is_active = true',
      [tenantId],
    );

    if (result.rows.length === 0) {
      return next(); // No tenant found — route guards will handle 401
    }

    const tenant = result.rows[0];
    const userEmail =
      (req.headers['x-user-email'] as string) ||
      process.env.DEFAULT_USER_EMAIL ||
      'admin@localhost';
    const userRoles = (
      (req.headers['x-user-roles'] as string) ||
      process.env.DEFAULT_USER_ROLES ||
      'admin'
    ).split(',') as ITenantContext['userRoles'];

    const ctx: ITenantContext = {
      tenantId: tenant.id,
      schemaName: tenant.schema_name,
      userId: tenantId, // In mock mode, use tenant ID as user ID
      userEmail,
      userRoles,
      entitlements: [tenant.subscription_tier],
    };

    this.cls.set('tenantContext', ctx);

    next();
  }
}
