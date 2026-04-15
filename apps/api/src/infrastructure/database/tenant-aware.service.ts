import { Injectable, Inject } from '@nestjs/common';
import { Pool, PoolClient, QueryResult } from 'pg';
import { ClsService } from 'nestjs-cls';
import { PG_POOL } from './database.constants';
import type { ITenantContext } from '@esg/shared-kernel';

/**
 * Tenant-aware database service.
 * Automatically sets the PostgreSQL search_path to the current tenant's schema
 * before executing every query. Uses CLS to read the tenant context.
 */
@Injectable()
export class TenantAwareService {
  constructor(
    @Inject(PG_POOL) private readonly pool: Pool,
    private readonly cls: ClsService,
  ) {}

  private getTenantContext(): ITenantContext {
    const ctx = this.cls.get<ITenantContext>('tenantContext');
    if (!ctx) {
      throw new Error(
        'TenantContext not found in CLS. Ensure request passes through auth middleware.',
      );
    }
    return ctx;
  }

  /**
   * Execute a query scoped to the current tenant's schema.
   * Prepends SET search_path before the query.
   */
  async query(text: string, params?: any[]): Promise<QueryResult> {
    const ctx = this.getTenantContext();
    const client = await this.pool.connect();
    try {
      await client.query(
        `SET search_path TO ${ctx.schemaName}, shared, public`,
      );
      return await client.query(text, params);
    } finally {
      // Reset search_path before returning to pool
      await client.query('SET search_path TO public').catch(() => {});
      client.release();
    }
  }

  /**
   * Execute a function within a tenant-scoped transaction.
   */
  async withTransaction<T>(
    fn: (client: PoolClient) => Promise<T>,
  ): Promise<T> {
    const ctx = this.getTenantContext();
    const client = await this.pool.connect();
    try {
      await client.query(
        `SET search_path TO ${ctx.schemaName}, shared, public`,
      );
      await client.query('BEGIN');
      const result = await fn(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      await client.query('SET search_path TO public').catch(() => {});
      client.release();
    }
  }

  /** Get the current tenant context */
  get tenantContext(): ITenantContext {
    return this.getTenantContext();
  }
}
