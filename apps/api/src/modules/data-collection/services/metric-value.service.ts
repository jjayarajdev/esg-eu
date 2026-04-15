import { Injectable } from '@nestjs/common';
import { NotFoundError, ValidationError } from '@esg/shared-kernel';
import { getMetricByCode } from '@esg/esrs-taxonomy';
import type { ESRSMetricDefinition } from '@esg/esrs-taxonomy';
import { TenantAwareService } from '../../../infrastructure/database/tenant-aware.service';
import { AuditService } from '../../../infrastructure/audit/audit.service';

export interface CreateDataPointDto {
  metricCode: string;
  reportingPeriodId: string;
  departmentId?: string;
  numericValue?: number;
  textValue?: string;
  booleanValue?: boolean;
  confidenceLevel?: string;
  dataSource?: string;
}

export interface UpdateDataPointDto {
  numericValue?: number;
  textValue?: string;
  booleanValue?: boolean;
  status?: string;
  confidenceLevel?: string;
  varianceExplanation?: string;
}

export interface DataPointRow {
  id: string;
  metric_def_id: string;
  metric_code: string;
  metric_name: string;
  standard_code: string;
  reporting_period_id: string;
  department_id: string | null;
  numeric_value: number | null;
  text_value: string | null;
  boolean_value: boolean | null;
  status: string;
  confidence_level: string | null;
  data_source: string | null;
  prior_period_value: number | null;
  variance_pct: number | null;
  variance_explanation: string | null;
  version: number;
  created_at: Date;
  updated_at: Date;
  created_by: string | null;
}

export interface ListDataPointsQuery {
  reportingPeriodId?: string;
  standardCode?: string;
  status?: string;
  departmentId?: string;
  page?: number;
  pageSize?: number;
}

@Injectable()
export class MetricValueService {
  constructor(
    private readonly db: TenantAwareService,
    private readonly audit: AuditService,
  ) {}

  async create(dto: CreateDataPointDto): Promise<DataPointRow> {
    // Resolve metric definition from taxonomy
    const metricDef = getMetricByCode(dto.metricCode);
    if (!metricDef) {
      throw new ValidationError(`Unknown metric code: ${dto.metricCode}`);
    }

    // Validate the value against the metric definition rules
    this.validateValue(dto, metricDef);

    // Use metric code directly as the identifier
    const metricDefId = dto.metricCode;

    // Calculate variance against prior period
    const variance = await this.calculateVariance(
      metricDefId,
      dto.reportingPeriodId,
      dto.departmentId || null,
      dto.numericValue,
    );

    const result = await this.db.query(
      `INSERT INTO metric_values
       (metric_def_id, reporting_period_id, department_id,
        numeric_value, text_value, boolean_value,
        status, confidence_level, data_source,
        prior_period_value, variance_pct)
       VALUES ($1, $2, $3, $4, $5, $6, 'draft', $7, $8, $9, $10)
       RETURNING *`,
      [
        metricDefId,
        dto.reportingPeriodId,
        dto.departmentId || null,
        dto.numericValue ?? null,
        dto.textValue ?? null,
        dto.booleanValue ?? null,
        dto.confidenceLevel || null,
        dto.dataSource || 'manual_entry',
        variance.priorValue,
        variance.variancePct,
      ],
    );

    const dataPoint = result.rows[0];

    await this.audit.log({
      action: 'created',
      entityType: 'metric_value',
      entityId: dataPoint.id,
      changes: {
        metricCode: dto.metricCode,
        numericValue: dto.numericValue,
        textValue: dto.textValue,
        booleanValue: dto.booleanValue,
      },
    });

    return this.enrichRow(dataPoint, dto.metricCode);
  }

  async update(id: string, dto: UpdateDataPointDto): Promise<DataPointRow> {
    const existing = await this.findByIdRaw(id);

    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;
    const changes: Record<string, unknown> = {};

    if (dto.numericValue !== undefined) {
      fields.push(`numeric_value = $${idx++}`);
      values.push(dto.numericValue);
      changes.numeric_value = { old: existing.numeric_value, new: dto.numericValue };
    }
    if (dto.textValue !== undefined) {
      fields.push(`text_value = $${idx++}`);
      values.push(dto.textValue);
      changes.text_value = { old: existing.text_value, new: dto.textValue };
    }
    if (dto.booleanValue !== undefined) {
      fields.push(`boolean_value = $${idx++}`);
      values.push(dto.booleanValue);
      changes.boolean_value = { old: existing.boolean_value, new: dto.booleanValue };
    }
    if (dto.status !== undefined) {
      fields.push(`status = $${idx++}`);
      values.push(dto.status);
      changes.status = { old: existing.status, new: dto.status };
    }
    if (dto.confidenceLevel !== undefined) {
      fields.push(`confidence_level = $${idx++}`);
      values.push(dto.confidenceLevel);
    }
    if (dto.varianceExplanation !== undefined) {
      fields.push(`variance_explanation = $${idx++}`);
      values.push(dto.varianceExplanation);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`version = version + 1`);
    fields.push(`updated_at = now()`);
    values.push(id);

    const result = await this.db.query(
      `UPDATE metric_values SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values,
    );

    if (result.rows.length === 0) {
      throw new NotFoundError(`Data point not found: ${id}`);
    }

    await this.audit.log({
      action: 'updated',
      entityType: 'metric_value',
      entityId: id,
      changes,
    });

    return this.enrichRow(result.rows[0]);
  }

  async findById(id: string): Promise<DataPointRow> {
    const row = await this.findByIdRaw(id);
    return this.enrichRow(row);
  }

  async list(query: ListDataPointsQuery): Promise<{ data: DataPointRow[]; total: number }> {
    const conditions: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (query.reportingPeriodId) {
      conditions.push(`mv.reporting_period_id = $${idx++}`);
      values.push(query.reportingPeriodId);
    }
    if (query.status) {
      conditions.push(`mv.status = $${idx++}`);
      values.push(query.status);
    }
    if (query.departmentId) {
      conditions.push(`mv.department_id = $${idx++}`);
      values.push(query.departmentId);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const page = query.page || 1;
    const pageSize = query.pageSize || 25;
    const offset = (page - 1) * pageSize;

    const countResult = await this.db.query(
      `SELECT count(*) as total FROM metric_values mv ${where}`,
      values,
    );

    const dataResult = await this.db.query(
      `SELECT mv.*
       FROM metric_values mv
       ${where}
       ORDER BY mv.created_at DESC
       LIMIT $${idx++} OFFSET $${idx++}`,
      [...values, pageSize, offset],
    );

    return {
      data: dataResult.rows.map((r: any) => this.enrichRow(r)),
      total: parseInt(countResult.rows[0].total, 10),
    };
  }

  async getHistory(id: string): Promise<any[]> {
    const result = await this.db.query(
      `SELECT * FROM audit_log
       WHERE entity_type = 'metric_value' AND entity_id = $1
       ORDER BY created_at DESC`,
      [id],
    );
    return result.rows;
  }

  private async findByIdRaw(id: string): Promise<any> {
    const result = await this.db.query(
      'SELECT * FROM metric_values WHERE id = $1',
      [id],
    );
    if (result.rows.length === 0) {
      throw new NotFoundError(`Data point not found: ${id}`);
    }
    return result.rows[0];
  }

  private enrichRow(row: any, metricCode?: string): DataPointRow {
    // Try to look up metric info from taxonomy
    const code = metricCode || row.metric_def_id;
    const def = getMetricByCode(code);
    return {
      ...row,
      metric_code: def?.code || code,
      metric_name: def?.name || 'Unknown metric',
      standard_code: def?.standardCode || 'unknown',
    };
  }

  private validateValue(dto: CreateDataPointDto, def: ESRSMetricDefinition): void {
    const rules = def.validationRules;
    if (!rules) return;

    if (def.isQuantitative && dto.numericValue === undefined && dto.numericValue !== 0) {
      if (rules.required) {
        throw new ValidationError(
          `Metric ${def.code} requires a numeric value.`,
          [{ field: 'numericValue', issue: 'required' }],
        );
      }
    }

    if (dto.numericValue !== undefined && rules.min !== undefined && dto.numericValue < rules.min) {
      throw new ValidationError(
        `Value ${dto.numericValue} is below minimum ${rules.min} for metric ${def.code}.`,
        [{ field: 'numericValue', issue: `min:${rules.min}` }],
      );
    }

    if (dto.numericValue !== undefined && rules.max !== undefined && dto.numericValue > rules.max) {
      throw new ValidationError(
        `Value ${dto.numericValue} exceeds maximum ${rules.max} for metric ${def.code}.`,
        [{ field: 'numericValue', issue: `max:${rules.max}` }],
      );
    }
  }

  private async calculateVariance(
    metricDefId: string,
    currentPeriodId: string,
    departmentId: string | null,
    currentValue?: number,
  ): Promise<{ priorValue: number | null; variancePct: number | null }> {
    if (currentValue === undefined || currentValue === null) {
      return { priorValue: null, variancePct: null };
    }

    // Find the prior period's value for the same metric + department
    const result = await this.db.query(
      `SELECT mv.numeric_value
       FROM metric_values mv
       JOIN reporting_periods rp ON rp.id = mv.reporting_period_id
       WHERE mv.metric_def_id = $1
         AND mv.reporting_period_id != $2
         AND ($3::uuid IS NULL OR mv.department_id = $3)
       ORDER BY rp.end_date DESC
       LIMIT 1`,
      [metricDefId, currentPeriodId, departmentId],
    );

    if (result.rows.length === 0 || result.rows[0].numeric_value === null) {
      return { priorValue: null, variancePct: null };
    }

    const priorValue = parseFloat(result.rows[0].numeric_value);
    const variancePct =
      priorValue !== 0
        ? ((currentValue - priorValue) / Math.abs(priorValue)) * 100
        : null;

    return { priorValue, variancePct };
  }
}
