import { Injectable } from '@nestjs/common';
import { NotFoundError, ValidationError } from '@esg/shared-kernel';
import { TenantAwareService } from '../../../infrastructure/database/tenant-aware.service';
import { AuditService } from '../../../infrastructure/audit/audit.service';

export interface CreateTaxonomyDto { reportingPeriodId: string; }

export interface AddActivityDto {
  naceCode: string;
  activityName: string;
  environmentalObjective: string;
  turnoverEur?: number;
  capexEur?: number;
  opexEur?: number;
}

export interface ScreenActivityDto {
  stepEligibility?: boolean;
  stepTechnical?: Record<string, boolean>;
  stepDnsh?: Record<string, boolean>;
  stepSocial?: boolean;
  turnoverEur?: number;
  capexEur?: number;
  opexEur?: number;
  notes?: string;
}

// Sample NACE activities for the EU Taxonomy
const SAMPLE_ACTIVITIES = [
  { naceCode: '4.1', name: 'Electricity generation using solar photovoltaic technology', objective: 'climate_mitigation' },
  { naceCode: '4.3', name: 'Electricity generation from wind power', objective: 'climate_mitigation' },
  { naceCode: '6.5', name: 'Transport by motorbikes, passenger cars and light commercial vehicles', objective: 'climate_mitigation' },
  { naceCode: '7.1', name: 'Construction of new buildings', objective: 'climate_mitigation' },
  { naceCode: '7.2', name: 'Renovation of existing buildings', objective: 'climate_mitigation' },
  { naceCode: '7.7', name: 'Acquisition and ownership of buildings', objective: 'climate_mitigation' },
  { naceCode: '3.3', name: 'Manufacture of low carbon technologies for transport', objective: 'climate_mitigation' },
  { naceCode: '5.1', name: 'Construction, extension and operation of water collection, treatment and supply systems', objective: 'water_protection' },
  { naceCode: '2.1', name: 'Restoration of wetlands', objective: 'biodiversity' },
  { naceCode: '5.9', name: 'Material recovery from non-hazardous waste', objective: 'circular_economy' },
];

const ENV_OBJECTIVES = [
  'climate_mitigation', 'climate_adaptation', 'water_protection',
  'circular_economy', 'pollution_prevention', 'biodiversity',
];

@Injectable()
export class TaxonomyService {
  constructor(
    private readonly db: TenantAwareService,
    private readonly audit: AuditService,
  ) {}

  async create(dto: CreateTaxonomyDto): Promise<any> {
    const result = await this.db.query(
      `INSERT INTO taxonomy_assessments (reporting_period_id) VALUES ($1) RETURNING *`,
      [dto.reportingPeriodId],
    );
    await this.audit.log({ action: 'created', entityType: 'taxonomy_assessment', entityId: result.rows[0].id });
    return this.findById(result.rows[0].id);
  }

  async findById(id: string): Promise<any> {
    const result = await this.db.query('SELECT * FROM taxonomy_assessments WHERE id = $1', [id]);
    if (result.rows.length === 0) throw new NotFoundError(`Taxonomy assessment not found: ${id}`);

    const activities = await this.db.query(
      'SELECT * FROM taxonomy_activity_screenings WHERE assessment_id = $1 ORDER BY nace_code',
      [id],
    );
    return { ...result.rows[0], activities: activities.rows };
  }

  async list(): Promise<any[]> {
    const result = await this.db.query('SELECT * FROM taxonomy_assessments ORDER BY created_at DESC');
    return result.rows;
  }

  async addActivity(assessmentId: string, dto: AddActivityDto): Promise<any> {
    const result = await this.db.query(
      `INSERT INTO taxonomy_activity_screenings
       (assessment_id, nace_code, activity_name, environmental_objective, turnover_eur, capex_eur, opex_eur)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [assessmentId, dto.naceCode, dto.activityName, dto.environmentalObjective,
       dto.turnoverEur || null, dto.capexEur || null, dto.opexEur || null],
    );
    return result.rows[0];
  }

  async screenActivity(assessmentId: string, activityId: string, dto: ScreenActivityDto): Promise<any> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (dto.stepEligibility !== undefined) { fields.push(`step_eligibility = $${idx++}`); values.push(dto.stepEligibility); }
    if (dto.stepTechnical !== undefined) { fields.push(`step_technical = $${idx++}`); values.push(JSON.stringify(dto.stepTechnical)); }
    if (dto.stepDnsh !== undefined) { fields.push(`step_dnsh = $${idx++}`); values.push(JSON.stringify(dto.stepDnsh)); }
    if (dto.stepSocial !== undefined) { fields.push(`step_social = $${idx++}`); values.push(dto.stepSocial); }
    if (dto.turnoverEur !== undefined) { fields.push(`turnover_eur = $${idx++}`); values.push(dto.turnoverEur); }
    if (dto.capexEur !== undefined) { fields.push(`capex_eur = $${idx++}`); values.push(dto.capexEur); }
    if (dto.opexEur !== undefined) { fields.push(`opex_eur = $${idx++}`); values.push(dto.opexEur); }
    if (dto.notes !== undefined) { fields.push(`notes = $${idx++}`); values.push(dto.notes); }

    // Auto-compute alignment
    const isAligned = dto.stepEligibility === true &&
      (dto.stepTechnical ? Object.values(dto.stepTechnical).every(Boolean) : false) &&
      (dto.stepDnsh ? Object.values(dto.stepDnsh).every(Boolean) : false) &&
      dto.stepSocial === true;
    fields.push(`is_aligned = $${idx++}`); values.push(isAligned);
    fields.push(`updated_at = now()`);
    values.push(activityId);

    const result = await this.db.query(
      `UPDATE taxonomy_activity_screenings SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values,
    );
    if (result.rows.length === 0) throw new NotFoundError('Activity not found');
    return result.rows[0];
  }

  async calculateKPIs(assessmentId: string): Promise<any> {
    const assessment = await this.findById(assessmentId);
    const activities = assessment.activities || [];

    let totalTurnover = 0, alignedTurnover = 0;
    let totalCapex = 0, alignedCapex = 0;
    let totalOpex = 0, alignedOpex = 0;

    for (const a of activities) {
      const t = Number(a.turnover_eur || 0);
      const c = Number(a.capex_eur || 0);
      const o = Number(a.opex_eur || 0);
      totalTurnover += t; totalCapex += c; totalOpex += o;
      if (a.is_aligned) { alignedTurnover += t; alignedCapex += c; alignedOpex += o; }
    }

    const turnoverPct = totalTurnover > 0 ? (alignedTurnover / totalTurnover) * 100 : 0;
    const capexPct = totalCapex > 0 ? (alignedCapex / totalCapex) * 100 : 0;
    const opexPct = totalOpex > 0 ? (alignedOpex / totalOpex) * 100 : 0;

    await this.db.query(
      `UPDATE taxonomy_assessments SET turnover_aligned_pct = $1, capex_aligned_pct = $2, opex_aligned_pct = $3, updated_at = now() WHERE id = $4`,
      [turnoverPct, capexPct, opexPct, assessmentId],
    );

    return { turnoverPct, capexPct, opexPct, totalActivities: activities.length, alignedActivities: activities.filter((a: any) => a.is_aligned).length };
  }

  getSampleActivities() { return SAMPLE_ACTIVITIES; }
  getEnvironmentalObjectives() { return ENV_OBJECTIVES; }
}
