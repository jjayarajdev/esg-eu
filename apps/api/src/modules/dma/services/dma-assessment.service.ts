import { Injectable } from '@nestjs/common';
import { NotFoundError, ValidationError } from '@esg/shared-kernel';
import { ESRS_STANDARDS } from '@esg/esrs-taxonomy';
import { TenantAwareService } from '../../../infrastructure/database/tenant-aware.service';
import { AuditService } from '../../../infrastructure/audit/audit.service';

export interface CreateDmaDto {
  reportingPeriodId: string;
  name: string;
  impactThreshold?: number;
  financialThreshold?: number;
}

export interface ScoreTopicDto {
  severity: number;
  likelihood: number;
  magnitude: number;
  probability: number;
  impactRationale?: string;
  financialRationale?: string;
}

export interface DmaAssessmentRow {
  id: string;
  reporting_period_id: string;
  name: string;
  status: string;
  methodology: any;
  finalized_at: Date | null;
  created_at: Date;
  updated_at: Date;
  topics?: TopicScoreRow[];
}

export interface TopicScoreRow {
  id: string;
  assessment_id: string;
  standard_id: string;
  standard_code: string;
  standard_name: string;
  standard_category: string;
  impact_score: number | null;
  financial_score: number | null;
  is_material: boolean | null;
  justification: any;
  created_at: Date;
  updated_at: Date;
}

// The 10 topical standards that DMA scores (exclude ESRS_1 and ESRS_2)
const TOPICAL_STANDARDS = ESRS_STANDARDS.filter(
  (s) => s.code !== 'ESRS_1' && s.code !== 'ESRS_2',
);

const DEFAULT_THRESHOLD = 9; // severity*likelihood >= 9 means material

@Injectable()
export class DmaAssessmentService {
  constructor(
    private readonly db: TenantAwareService,
    private readonly audit: AuditService,
  ) {}

  async create(dto: CreateDmaDto): Promise<DmaAssessmentRow> {
    const methodology = {
      impactThreshold: dto.impactThreshold ?? DEFAULT_THRESHOLD,
      financialThreshold: dto.financialThreshold ?? DEFAULT_THRESHOLD,
      scoringScale: 5,
    };

    // Create the assessment
    const result = await this.db.query(
      `INSERT INTO dma_assessments (reporting_period_id, name, status, methodology)
       VALUES ($1, $2, 'draft', $3)
       RETURNING *`,
      [dto.reportingPeriodId, dto.name, JSON.stringify(methodology)],
    );
    const assessment = result.rows[0];

    // Auto-populate topic score rows for all 10 topical standards
    for (const std of TOPICAL_STANDARDS) {
      // Look up standard UUID from shared schema
      const stdResult = await this.db.query(
        'SELECT id FROM esrs_standards WHERE code = $1',
        [std.code],
      );
      const standardId = stdResult.rows.length > 0 ? stdResult.rows[0].id : std.code;

      await this.db.query(
        `INSERT INTO dma_topic_scores (assessment_id, standard_id)
         VALUES ($1, $2)
         ON CONFLICT (assessment_id, standard_id) DO NOTHING`,
        [assessment.id, standardId],
      );
    }

    await this.audit.log({
      action: 'created',
      entityType: 'dma_assessment',
      entityId: assessment.id,
      changes: { name: dto.name, reportingPeriodId: dto.reportingPeriodId },
    });

    return this.findById(assessment.id);
  }

  async findById(id: string): Promise<DmaAssessmentRow> {
    const result = await this.db.query(
      'SELECT * FROM dma_assessments WHERE id = $1',
      [id],
    );
    if (result.rows.length === 0) {
      throw new NotFoundError(`DMA assessment not found: ${id}`);
    }

    const topics = await this.db.query(
      `SELECT ts.*, s.code as standard_code, s.name as standard_name, s.category as standard_category
       FROM dma_topic_scores ts
       LEFT JOIN esrs_standards s ON s.id = ts.standard_id
       WHERE ts.assessment_id = $1
       ORDER BY s.sort_order`,
      [id],
    );

    return { ...result.rows[0], topics: topics.rows } as DmaAssessmentRow;
  }

  async list(): Promise<DmaAssessmentRow[]> {
    const result = await this.db.query(
      'SELECT * FROM dma_assessments ORDER BY created_at DESC',
    );
    return result.rows as DmaAssessmentRow[];
  }

  async scoreTopic(
    assessmentId: string,
    standardCode: string,
    dto: ScoreTopicDto,
  ): Promise<TopicScoreRow> {
    // Validate assessment exists and is not finalized
    const assessment = await this.findById(assessmentId);
    if (assessment.status === 'finalized') {
      throw new ValidationError('Cannot score topics on a finalized assessment.');
    }

    // Validate scores are in range 1-5
    for (const [field, val] of Object.entries({
      severity: dto.severity,
      likelihood: dto.likelihood,
      magnitude: dto.magnitude,
      probability: dto.probability,
    })) {
      if (val < 1 || val > 5) {
        throw new ValidationError(`${field} must be between 1 and 5.`);
      }
    }

    // Calculate composite scores
    const impactScore = dto.severity * dto.likelihood;
    const financialScore = dto.magnitude * dto.probability;

    // Store sub-scores as structured JSON in justification
    const justification = JSON.stringify({
      impact: { severity: dto.severity, likelihood: dto.likelihood, rationale: dto.impactRationale || '' },
      financial: { magnitude: dto.magnitude, probability: dto.probability, rationale: dto.financialRationale || '' },
    });

    // Look up standard UUID
    const stdResult = await this.db.query(
      'SELECT id FROM esrs_standards WHERE code = $1',
      [standardCode],
    );
    if (stdResult.rows.length === 0) {
      throw new NotFoundError(`Standard not found: ${standardCode}`);
    }
    const standardId = stdResult.rows[0].id;

    const result = await this.db.query(
      `UPDATE dma_topic_scores
       SET impact_score = $1, financial_score = $2, justification = $3, updated_at = now()
       WHERE assessment_id = $4 AND standard_id = $5
       RETURNING *`,
      [impactScore, financialScore, justification, assessmentId, standardId],
    );

    if (result.rows.length === 0) {
      throw new NotFoundError(`Topic score not found for standard ${standardCode} in assessment ${assessmentId}`);
    }

    // Update assessment status to in_progress if still draft
    if (assessment.status === 'draft') {
      await this.db.query(
        `UPDATE dma_assessments SET status = 'in_progress', updated_at = now() WHERE id = $1`,
        [assessmentId],
      );
    }

    await this.audit.log({
      action: 'updated',
      entityType: 'dma_topic_score',
      entityId: result.rows[0].id,
      changes: { standardCode, impactScore, financialScore },
    });

    // Re-fetch with joined standard info
    const enriched = await this.db.query(
      `SELECT ts.*, s.code as standard_code, s.name as standard_name, s.category as standard_category
       FROM dma_topic_scores ts
       LEFT JOIN esrs_standards s ON s.id = ts.standard_id
       WHERE ts.id = $1`,
      [result.rows[0].id],
    );

    return enriched.rows[0] as TopicScoreRow;
  }

  async finalize(assessmentId: string): Promise<DmaAssessmentRow> {
    const assessment = await this.findById(assessmentId);
    if (assessment.status === 'finalized') {
      throw new ValidationError('Assessment is already finalized.');
    }

    // Check all topics have been scored
    const unscored = assessment.topics?.filter(
      (t) => t.impact_score === null || t.financial_score === null,
    );
    if (unscored && unscored.length > 0) {
      throw new ValidationError(
        `${unscored.length} topics have not been scored yet: ${unscored.map((t) => t.standard_code).join(', ')}`,
      );
    }

    const methodology = assessment.methodology || {};
    const impactThreshold = methodology.impactThreshold ?? DEFAULT_THRESHOLD;
    const financialThreshold = methodology.financialThreshold ?? DEFAULT_THRESHOLD;

    // Compute is_material for each topic
    for (const topic of assessment.topics || []) {
      const isMaterial =
        (topic.impact_score !== null && topic.impact_score >= impactThreshold) ||
        (topic.financial_score !== null && topic.financial_score >= financialThreshold);

      await this.db.query(
        `UPDATE dma_topic_scores SET is_material = $1, updated_at = now() WHERE id = $2`,
        [isMaterial, topic.id],
      );
    }

    // Finalize the assessment
    await this.db.query(
      `UPDATE dma_assessments SET status = 'finalized', finalized_at = now(), updated_at = now() WHERE id = $1`,
      [assessmentId],
    );

    await this.audit.log({
      action: 'finalized',
      entityType: 'dma_assessment',
      entityId: assessmentId,
      changes: { impactThreshold, financialThreshold },
    });

    return this.findById(assessmentId);
  }

  async getMaterialTopics(assessmentId: string): Promise<TopicScoreRow[]> {
    const assessment = await this.findById(assessmentId);
    return (assessment.topics || []).filter((t) => t.is_material === true);
  }

  async getMatrix(assessmentId: string): Promise<{
    topics: TopicScoreRow[];
    thresholds: { impact: number; financial: number };
    summary: { total: number; material: number; nonMaterial: number };
  }> {
    const assessment = await this.findById(assessmentId);
    const methodology = assessment.methodology || {};
    const topics = assessment.topics || [];

    return {
      topics,
      thresholds: {
        impact: methodology.impactThreshold ?? DEFAULT_THRESHOLD,
        financial: methodology.financialThreshold ?? DEFAULT_THRESHOLD,
      },
      summary: {
        total: topics.length,
        material: topics.filter((t) => t.is_material === true).length,
        nonMaterial: topics.filter((t) => t.is_material === false).length,
      },
    };
  }
}
