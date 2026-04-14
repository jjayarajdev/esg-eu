/**
 * Audit trail types.
 * Every critical action is logged to an append-only audit_log table.
 * Required for ESRS limited assurance compliance.
 */

/** Actions that must always be audited */
export type AuditAction =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'approved'
  | 'rejected'
  | 'submitted'
  | 'finalized'
  | 'published'
  | 'exported'
  | 'role_changed'
  | 'user_invited'
  | 'user_removed'
  | 'connector_synced'
  | 'report_generated'
  | 'schema_provisioned'
  | 'schema_deleted';

/** A single audit log entry */
export interface AuditEntry {
  /** UUID of the audit entry */
  id: string;

  /** User who performed the action (null for system actions) */
  userId: string | null;

  /** The action performed */
  action: AuditAction;

  /** Entity type being acted on, e.g., 'metric_value', 'report', 'dma_assessment' */
  entityType: string;

  /** UUID of the entity */
  entityId: string | null;

  /** What changed: { field: string, old: unknown, new: unknown }[] */
  changes: Record<string, unknown> | null;

  /** Client IP address */
  ipAddress: string | null;

  /** Client user agent */
  userAgent: string | null;

  /** When the action occurred */
  createdAt: Date;
}
