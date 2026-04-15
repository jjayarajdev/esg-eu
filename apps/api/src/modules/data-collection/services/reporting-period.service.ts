import { Injectable } from '@nestjs/common';
import { NotFoundError, ConflictError } from '@esg/shared-kernel';
import { TenantAwareService } from '../../../infrastructure/database/tenant-aware.service';
import { AuditService } from '../../../infrastructure/audit/audit.service';

export interface CreateReportingPeriodDto {
  name: string;
  periodType?: string;
  startDate: string;
  endDate: string;
  isCurrent?: boolean;
}

export interface ReportingPeriodRow {
  id: string;
  name: string;
  period_type: string;
  start_date: string;
  end_date: string;
  is_locked: boolean;
  is_current: boolean;
  created_at: Date;
}

@Injectable()
export class ReportingPeriodService {
  constructor(
    private readonly db: TenantAwareService,
    private readonly audit: AuditService,
  ) {}

  async create(dto: CreateReportingPeriodDto): Promise<ReportingPeriodRow> {
    // Check for overlapping periods
    const existing = await this.db.query(
      `SELECT id FROM reporting_periods
       WHERE start_date = $1 AND end_date = $2`,
      [dto.startDate, dto.endDate],
    );
    if (existing.rows.length > 0) {
      throw new ConflictError('A reporting period with these dates already exists.');
    }

    // If setting as current, unset any existing current period
    if (dto.isCurrent) {
      await this.db.query(
        'UPDATE reporting_periods SET is_current = false WHERE is_current = true',
      );
    }

    const result = await this.db.query(
      `INSERT INTO reporting_periods (name, period_type, start_date, end_date, is_current)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        dto.name,
        dto.periodType || 'annual',
        dto.startDate,
        dto.endDate,
        dto.isCurrent || false,
      ],
    );

    const period = result.rows[0] as ReportingPeriodRow;

    await this.audit.log({
      action: 'created',
      entityType: 'reporting_period',
      entityId: period.id,
    });

    return period;
  }

  async findById(id: string): Promise<ReportingPeriodRow> {
    const result = await this.db.query(
      'SELECT * FROM reporting_periods WHERE id = $1',
      [id],
    );
    if (result.rows.length === 0) {
      throw new NotFoundError(`Reporting period not found: ${id}`);
    }
    return result.rows[0] as ReportingPeriodRow;
  }

  async list(): Promise<ReportingPeriodRow[]> {
    const result = await this.db.query(
      'SELECT * FROM reporting_periods ORDER BY start_date DESC',
    );
    return result.rows as ReportingPeriodRow[];
  }
}
