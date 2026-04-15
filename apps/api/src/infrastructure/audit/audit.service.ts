import { Injectable } from '@nestjs/common';
import { TenantAwareService } from '../database/tenant-aware.service';
import type { AuditAction } from '@esg/shared-kernel';

/**
 * Audit service — writes to the tenant's audit_log table.
 * Every critical action must be logged for ESRS limited assurance compliance.
 * The audit_log table is append-only — no updates or deletes allowed.
 */
@Injectable()
export class AuditService {
  constructor(private readonly db: TenantAwareService) {}

  async log(params: {
    action: AuditAction;
    entityType: string;
    entityId?: string;
    changes?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    const ctx = this.db.tenantContext;

    await this.db.query(
      `INSERT INTO audit_log (user_id, action, entity_type, entity_id, changes, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        ctx.userId,
        params.action,
        params.entityType,
        params.entityId ?? null,
        params.changes ? JSON.stringify(params.changes) : null,
        params.ipAddress ?? null,
        params.userAgent ?? null,
      ],
    );
  }
}
