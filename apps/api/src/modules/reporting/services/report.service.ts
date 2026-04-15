import { Injectable } from '@nestjs/common';
import { NotFoundError, ValidationError } from '@esg/shared-kernel';
import { getMetricsByStandard } from '@esg/esrs-taxonomy';
import { TenantAwareService } from '../../../infrastructure/database/tenant-aware.service';
import { AuditService } from '../../../infrastructure/audit/audit.service';
import { AiService } from '../../ai/services/ai.service';

export interface CreateReportDto {
  reportingPeriodId: string;
  name: string;
  dmaAssessmentId: string;
}

export interface ReportRow {
  id: string;
  reporting_period_id: string;
  report_type: string;
  status: string;
  metadata: ReportMetadata;
  generated_at: Date | null;
  created_at: Date;
}

export interface ReportMetadata {
  name: string;
  dmaAssessmentId: string;
  sections: ReportSection[];
}

export interface ReportSection {
  standardCode: string;
  standardName: string;
  category: string;
  status: 'pending' | 'generated' | 'edited' | 'finalized';
  dataPoints: Array<{ metricCode: string; metricName: string; value: number | null; unit: string | null }>;
  narrative: string;
  narrativeSource: 'ai_generated' | 'manual' | 'none';
}

@Injectable()
export class ReportService {
  constructor(
    private readonly db: TenantAwareService,
    private readonly audit: AuditService,
    private readonly ai: AiService,
  ) {}

  async create(dto: CreateReportDto): Promise<ReportRow> {
    // Get material topics from DMA
    const dmaResult = await this.db.query(
      `SELECT ts.*, s.code as standard_code, s.name as standard_name, s.category as standard_category
       FROM dma_topic_scores ts
       JOIN dma_assessments da ON da.id = ts.assessment_id
       LEFT JOIN esrs_standards s ON s.id = ts.standard_id
       WHERE ts.assessment_id = $1 AND ts.is_material = true
       ORDER BY s.sort_order`,
      [dto.dmaAssessmentId],
    );

    if (dmaResult.rows.length === 0) {
      throw new ValidationError('No material topics found. Finalize the DMA assessment first.');
    }

    // Build initial sections from material topics
    const sections: ReportSection[] = [];
    for (const topic of dmaResult.rows) {
      // Get data points for this standard
      const dpResult = await this.db.query(
        `SELECT mv.metric_def_id, mv.numeric_value, mv.text_value
         FROM metric_values mv
         WHERE mv.reporting_period_id = $1
           AND mv.metric_def_id LIKE $2
         ORDER BY mv.metric_def_id`,
        [dto.reportingPeriodId, `${topic.standard_code}_%`],
      );

      const taxonomyMetrics = getMetricsByStandard(topic.standard_code);
      const dataPoints = dpResult.rows.map((dp: any) => {
        const def = taxonomyMetrics.find((m) => m.code === dp.metric_def_id);
        return {
          metricCode: dp.metric_def_id,
          metricName: def?.name || dp.metric_def_id,
          value: dp.numeric_value ? parseFloat(dp.numeric_value) : null,
          unit: def?.unit || null,
        };
      });

      sections.push({
        standardCode: topic.standard_code,
        standardName: topic.standard_name,
        category: topic.standard_category,
        status: 'pending',
        dataPoints,
        narrative: '',
        narrativeSource: 'none',
      });
    }

    const metadata: ReportMetadata = {
      name: dto.name,
      dmaAssessmentId: dto.dmaAssessmentId,
      sections,
    };

    const result = await this.db.query(
      `INSERT INTO reports (reporting_period_id, report_type, status, metadata)
       VALUES ($1, 'esrs_annual', 'draft', $2)
       RETURNING *`,
      [dto.reportingPeriodId, JSON.stringify(metadata)],
    );

    await this.audit.log({
      action: 'created',
      entityType: 'report',
      entityId: result.rows[0].id,
      changes: { name: dto.name, sections: sections.length },
    });

    return this.parseRow(result.rows[0]);
  }

  async findById(id: string): Promise<ReportRow> {
    const result = await this.db.query('SELECT * FROM reports WHERE id = $1', [id]);
    if (result.rows.length === 0) throw new NotFoundError(`Report not found: ${id}`);
    return this.parseRow(result.rows[0]);
  }

  async list(): Promise<ReportRow[]> {
    const result = await this.db.query('SELECT * FROM reports ORDER BY created_at DESC');
    return result.rows.map((r: any) => this.parseRow(r));
  }

  async generateSection(reportId: string, standardCode: string): Promise<ReportSection> {
    const report = await this.findById(reportId);
    if (report.status === 'finalized') throw new ValidationError('Cannot modify a finalized report.');

    const section = report.metadata.sections.find((s) => s.standardCode === standardCode);
    if (!section) throw new NotFoundError(`Section not found: ${standardCode}`);

    // Generate AI narrative
    const validDataPoints = section.dataPoints.filter((dp) => dp.value !== null);
    const aiResult = await this.ai.synthesizeNarrative({
      standardCode: section.standardCode,
      standardName: section.standardName,
      dataPoints: validDataPoints.map((dp) => ({
        metricCode: dp.metricCode,
        metricName: dp.metricName,
        value: dp.value!,
        unit: dp.unit || '',
      })),
    });

    section.narrative = aiResult.text;
    section.narrativeSource = 'ai_generated';
    section.status = 'generated';

    await this.updateMetadata(reportId, report.metadata);

    return section;
  }

  async generateFullReport(reportId: string): Promise<ReportRow> {
    const report = await this.findById(reportId);
    if (report.status === 'finalized') throw new ValidationError('Cannot modify a finalized report.');

    for (const section of report.metadata.sections) {
      if (section.status === 'pending') {
        const validDataPoints = section.dataPoints.filter((dp) => dp.value !== null);
        const aiResult = await this.ai.synthesizeNarrative({
          standardCode: section.standardCode,
          standardName: section.standardName,
          dataPoints: validDataPoints.map((dp) => ({
            metricCode: dp.metricCode,
            metricName: dp.metricName,
            value: dp.value!,
            unit: dp.unit || '',
          })),
          additionalContext: validDataPoints.length === 0
            ? 'No quantitative data points are available for this standard in the current reporting period. Generate a general policy and approach narrative based on typical ESRS disclosure requirements.'
            : undefined,
        });
        section.narrative = aiResult.text;
        section.narrativeSource = 'ai_generated';
        section.status = 'generated';
      }
    }

    await this.updateMetadata(reportId, report.metadata);
    await this.db.query(
      `UPDATE reports SET status = 'generated', generated_at = now(), updated_at = now() WHERE id = $1`,
      [reportId],
    );

    await this.audit.log({ action: 'report_generated', entityType: 'report', entityId: reportId });

    return this.findById(reportId);
  }

  async updateSectionNarrative(reportId: string, standardCode: string, narrative: string): Promise<ReportSection> {
    const report = await this.findById(reportId);
    if (report.status === 'finalized') throw new ValidationError('Cannot modify a finalized report.');

    const section = report.metadata.sections.find((s) => s.standardCode === standardCode);
    if (!section) throw new NotFoundError(`Section not found: ${standardCode}`);

    section.narrative = narrative;
    section.narrativeSource = 'manual';
    section.status = 'edited';

    await this.updateMetadata(reportId, report.metadata);
    return section;
  }

  async finalize(reportId: string): Promise<ReportRow> {
    const report = await this.findById(reportId);
    const pendingSections = report.metadata.sections.filter((s) => s.status === 'pending');
    if (pendingSections.length > 0) {
      throw new ValidationError(`${pendingSections.length} sections have no narrative yet: ${pendingSections.map((s) => s.standardCode).join(', ')}`);
    }

    report.metadata.sections.forEach((s) => (s.status = 'finalized'));
    await this.updateMetadata(reportId, report.metadata);
    await this.db.query(
      `UPDATE reports SET status = 'finalized', updated_at = now() WHERE id = $1`,
      [reportId],
    );

    await this.audit.log({ action: 'finalized', entityType: 'report', entityId: reportId });
    return this.findById(reportId);
  }

  async exportHtml(reportId: string): Promise<string> {
    const report = await this.findById(reportId);
    const m = report.metadata;

    let html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>${m.name}</title>
<style>body{font-family:system-ui,sans-serif;max-width:900px;margin:2rem auto;color:#1f2937}
h1{border-bottom:2px solid #3b82f6;padding-bottom:0.5rem}
h2{color:#3b82f6;margin-top:2rem}
table{width:100%;border-collapse:collapse;margin:1rem 0}
th,td{padding:0.5rem;text-align:left;border-bottom:1px solid #e5e7eb}
th{background:#f9fafb;font-weight:600}
td.num{text-align:right;font-variant-numeric:tabular-nums}
.narrative{background:#f0f9ff;padding:1rem;border-radius:8px;border-left:4px solid #3b82f6;margin:1rem 0}
.badge{display:inline-block;padding:2px 8px;border-radius:12px;font-size:0.7rem;font-weight:600;text-transform:uppercase}
</style></head>
<body>
<h1>${m.name}</h1>
<p>Report Type: ESRS Annual | Status: ${report.status} | Sections: ${m.sections.length}</p>\n`;

    for (const section of m.sections) {
      html += `<h2>${section.standardCode} — ${section.standardName}</h2>\n`;

      if (section.dataPoints.length > 0) {
        html += `<table><thead><tr><th>Metric</th><th>Value</th><th>Unit</th></tr></thead><tbody>\n`;
        for (const dp of section.dataPoints) {
          html += `<tr><td>${dp.metricName}</td><td class="num">${dp.value !== null ? dp.value.toLocaleString() : '—'}</td><td>${dp.unit || ''}</td></tr>\n`;
        }
        html += `</tbody></table>\n`;
      }

      if (section.narrative) {
        html += `<div class="narrative">${section.narrative}</div>\n`;
      }
    }

    html += `</body></html>`;
    return html;
  }

  private async updateMetadata(reportId: string, metadata: ReportMetadata): Promise<void> {
    await this.db.query(
      'UPDATE reports SET metadata = $1, updated_at = now() WHERE id = $2',
      [JSON.stringify(metadata), reportId],
    );
  }

  private parseRow(row: any): ReportRow {
    return {
      ...row,
      metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata,
    };
  }
}
