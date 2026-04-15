import { Injectable, Inject } from '@nestjs/common';
import { NotFoundError, ValidationError, DomainEvent } from '@esg/shared-kernel';
import type { IEventBus } from '@esg/shared-kernel';
import { EVENT_BUS } from '@esg/shared-kernel';
import { TenantAwareService } from '../../../infrastructure/database/tenant-aware.service';
import { AuditService } from '../../../infrastructure/audit/audit.service';

export interface CreateWorkflowDto {
  entityType: string;
  entityId: string;
  steps: Array<{
    stepName: string;
    requiredRole: string;
    assignedTo?: string;
  }>;
}

export interface WorkflowRow {
  id: string;
  entity_type: string;
  entity_id: string;
  status: string;
  current_step_order: number;
  total_steps: number;
  initiated_by: string | null;
  completed_at: Date | null;
  created_at: Date;
  updated_at: Date;
  steps?: StepRow[];
}

export interface StepRow {
  id: string;
  workflow_id: string;
  step_order: number;
  step_name: string;
  required_role: string;
  assigned_to: string | null;
  status: string;
  decision: string | null;
  comments: string | null;
  decided_at: Date | null;
  created_at: Date;
}

// Domain events
class WorkflowCompletedEvent extends DomainEvent {
  readonly eventType = 'workflow.completed';
  constructor(
    tenantId: string,
    userId: string,
    readonly workflowId: string,
    readonly entityType: string,
    readonly entityId: string,
  ) {
    super(tenantId, userId);
  }
  protected getPayload() { return { workflowId: this.workflowId, entityType: this.entityType, entityId: this.entityId }; }
}

class WorkflowRejectedEvent extends DomainEvent {
  readonly eventType = 'workflow.rejected';
  constructor(
    tenantId: string,
    userId: string,
    readonly workflowId: string,
    readonly entityType: string,
    readonly entityId: string,
  ) {
    super(tenantId, userId);
  }
  protected getPayload() { return { workflowId: this.workflowId, entityType: this.entityType, entityId: this.entityId }; }
}

@Injectable()
export class WorkflowService {
  constructor(
    private readonly db: TenantAwareService,
    private readonly audit: AuditService,
    @Inject(EVENT_BUS) private readonly eventBus: IEventBus,
  ) {}

  async create(dto: CreateWorkflowDto): Promise<WorkflowRow> {
    if (dto.steps.length === 0) {
      throw new ValidationError('Workflow must have at least one approval step.');
    }

    // Create workflow
    const wfResult = await this.db.query(
      `INSERT INTO approval_workflows (entity_type, entity_id, status, current_step_order, total_steps)
       VALUES ($1, $2, 'pending', 1, $3)
       RETURNING *`,
      [dto.entityType, dto.entityId, dto.steps.length],
    );
    const workflow = wfResult.rows[0] as WorkflowRow;

    // Create steps
    const steps: StepRow[] = [];
    for (let i = 0; i < dto.steps.length; i++) {
      const step = dto.steps[i];
      const stepResult = await this.db.query(
        `INSERT INTO approval_steps (workflow_id, step_order, step_name, required_role, assigned_to, status)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          workflow.id,
          i + 1,
          step.stepName,
          step.requiredRole,
          step.assignedTo || null,
          i === 0 ? 'active' : 'pending',
        ],
      );
      steps.push(stepResult.rows[0] as StepRow);
    }

    await this.audit.log({
      action: 'created',
      entityType: 'approval_workflow',
      entityId: workflow.id,
      changes: { entityType: dto.entityType, entityId: dto.entityId, totalSteps: dto.steps.length },
    });

    return { ...workflow, steps };
  }

  async approve(workflowId: string, stepId: string, comments?: string): Promise<WorkflowRow> {
    const workflow = await this.findById(workflowId);
    const step = workflow.steps?.find((s) => s.id === stepId);

    if (!step) throw new NotFoundError(`Step not found: ${stepId}`);
    if (step.status !== 'active') throw new ValidationError('This step is not active for approval.');

    // Mark step as approved
    await this.db.query(
      `UPDATE approval_steps SET status = 'completed', decision = 'approved', comments = $1, decided_at = now()
       WHERE id = $2`,
      [comments || null, stepId],
    );

    // Check if there's a next step
    const nextStepOrder = step.step_order + 1;
    if (nextStepOrder <= workflow.total_steps) {
      // Activate next step
      await this.db.query(
        `UPDATE approval_steps SET status = 'active' WHERE workflow_id = $1 AND step_order = $2`,
        [workflowId, nextStepOrder],
      );
      await this.db.query(
        `UPDATE approval_workflows SET current_step_order = $1, updated_at = now() WHERE id = $2`,
        [nextStepOrder, workflowId],
      );
    } else {
      // All steps complete — workflow approved
      await this.db.query(
        `UPDATE approval_workflows SET status = 'approved', completed_at = now(), updated_at = now() WHERE id = $1`,
        [workflowId],
      );

      // Update the source entity status
      await this.updateEntityStatus(workflow.entity_type, workflow.entity_id, 'approved');

      // Emit event
      const ctx = this.db.tenantContext;
      await this.eventBus.publish(
        new WorkflowCompletedEvent(ctx.tenantId, ctx.userId, workflowId, workflow.entity_type, workflow.entity_id),
      );
    }

    await this.audit.log({
      action: 'approved',
      entityType: 'approval_workflow',
      entityId: workflowId,
      changes: { stepId, stepOrder: step.step_order, comments },
    });

    return this.findById(workflowId);
  }

  async reject(workflowId: string, stepId: string, comments: string): Promise<WorkflowRow> {
    const workflow = await this.findById(workflowId);
    const step = workflow.steps?.find((s) => s.id === stepId);

    if (!step) throw new NotFoundError(`Step not found: ${stepId}`);
    if (step.status !== 'active') throw new ValidationError('This step is not active for rejection.');
    if (!comments) throw new ValidationError('Rejection requires a comment explaining the reason.');

    // Mark step as rejected
    await this.db.query(
      `UPDATE approval_steps SET status = 'completed', decision = 'rejected', comments = $1, decided_at = now()
       WHERE id = $2`,
      [comments, stepId],
    );

    // Reject the entire workflow
    await this.db.query(
      `UPDATE approval_workflows SET status = 'rejected', completed_at = now(), updated_at = now() WHERE id = $1`,
      [workflowId],
    );

    // Update the source entity status
    await this.updateEntityStatus(workflow.entity_type, workflow.entity_id, 'rejected');

    // Emit event
    const ctx = this.db.tenantContext;
    await this.eventBus.publish(
      new WorkflowRejectedEvent(ctx.tenantId, ctx.userId, workflowId, workflow.entity_type, workflow.entity_id),
    );

    await this.audit.log({
      action: 'rejected',
      entityType: 'approval_workflow',
      entityId: workflowId,
      changes: { stepId, stepOrder: step.step_order, comments },
    });

    return this.findById(workflowId);
  }

  async findById(id: string): Promise<WorkflowRow> {
    const wfResult = await this.db.query(
      'SELECT * FROM approval_workflows WHERE id = $1',
      [id],
    );
    if (wfResult.rows.length === 0) throw new NotFoundError(`Workflow not found: ${id}`);

    const stepsResult = await this.db.query(
      'SELECT * FROM approval_steps WHERE workflow_id = $1 ORDER BY step_order',
      [id],
    );

    return { ...wfResult.rows[0], steps: stepsResult.rows } as WorkflowRow;
  }

  async listPending(): Promise<WorkflowRow[]> {
    const result = await this.db.query(
      `SELECT w.*, s.id as active_step_id, s.step_name as active_step_name, s.required_role as active_role
       FROM approval_workflows w
       JOIN approval_steps s ON s.workflow_id = w.id AND s.status = 'active'
       WHERE w.status = 'pending'
       ORDER BY w.created_at DESC`,
    );
    return result.rows as WorkflowRow[];
  }

  async list(filters?: { status?: string; entityType?: string }): Promise<WorkflowRow[]> {
    const conditions: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (filters?.status) {
      conditions.push(`status = $${idx++}`);
      values.push(filters.status);
    }
    if (filters?.entityType) {
      conditions.push(`entity_type = $${idx++}`);
      values.push(filters.entityType);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await this.db.query(
      `SELECT * FROM approval_workflows ${where} ORDER BY created_at DESC`,
      values,
    );
    return result.rows as WorkflowRow[];
  }

  private async updateEntityStatus(entityType: string, entityId: string, status: string): Promise<void> {
    // Update the source entity's status based on entity type
    const tableMap: Record<string, string> = {
      metric_value: 'metric_values',
      report: 'reports',
      dma_assessment: 'dma_assessments',
    };

    const table = tableMap[entityType];
    if (table) {
      await this.db.query(
        `UPDATE ${table} SET status = $1, updated_at = now() WHERE id = $2`,
        [status, entityId],
      );
    }
  }
}
