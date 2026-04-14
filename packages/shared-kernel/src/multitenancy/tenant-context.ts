import type { UserRole, SubscriptionTier } from '../types';

/**
 * Tenant context interface — the identity of the current request.
 * Populated by middleware from JWT claims, available everywhere via CLS.
 */
export interface ITenantContext {
  /** Tenant UUID */
  tenantId: string;

  /** PostgreSQL schema name, e.g., 'tenant_akzonobel' */
  schemaName: string;

  /** User UUID from Auth0/Clerk */
  userId: string;

  /** User's email */
  userEmail: string;

  /** User's roles within this tenant */
  userRoles: UserRole[];

  /** Tenant's subscription tier — gates access to modules like SFDR */
  entitlements: SubscriptionTier[];
}

/**
 * In-memory tenant context holder.
 * In NestJS, this will be backed by nestjs-cls (continuation-local storage)
 * so every async operation in the request chain gets the same context
 * without passing it explicitly.
 *
 * Usage:
 *   const ctx = TenantContext.current();
 *   await db.query(`SET search_path TO ${ctx.schemaName}, shared, public`);
 */
export class TenantContext {
  private static storage: ITenantContext | null = null;

  /** Set context for the current request (called by middleware) */
  static set(ctx: ITenantContext): void {
    TenantContext.storage = ctx;
  }

  /** Get context for the current request */
  static current(): ITenantContext {
    if (!TenantContext.storage) {
      throw new Error(
        'TenantContext not initialized. Ensure TenantMiddleware is applied.',
      );
    }
    return TenantContext.storage;
  }

  /** Check if context is available (for optional tenant routes) */
  static isAvailable(): boolean {
    return TenantContext.storage !== null;
  }

  /** Clear context (called at end of request lifecycle) */
  static clear(): void {
    TenantContext.storage = null;
  }

  /**
   * Generate the PostgreSQL schema name for a tenant slug.
   * Convention: tenant_{slug} where slug is lowercase alphanumeric + underscores.
   */
  static schemaNameFromSlug(slug: string): string {
    const sanitized = slug.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    return `tenant_${sanitized}`;
  }

  /**
   * SQL to set the search_path for the current tenant.
   * Includes 'shared' schema for ESRS reference data and 'public' for extensions.
   */
  static searchPathSQL(schemaName: string): string {
    return `SET search_path TO ${schemaName}, shared, public`;
  }
}
