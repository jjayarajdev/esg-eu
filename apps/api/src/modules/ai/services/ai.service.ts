import { Injectable, Inject } from '@nestjs/common';
import { getMetricByCode } from '@esg/esrs-taxonomy';
import { TenantAwareService } from '../../../infrastructure/database/tenant-aware.service';
import type { IAiProvider } from '../providers/ai-provider.port';
import { AI_PROVIDER } from '../providers/ai-provider.port';

const ESG_SYSTEM_PROMPT = `You are an expert ESG (Environmental, Social, Governance) reporting analyst specializing in the European Sustainability Reporting Standards (ESRS) under the Corporate Sustainability Reporting Directive (CSRD).

Your responses must be:
- Professional and suitable for inclusion in regulatory sustainability reports
- Factual and evidence-based, referencing specific data points when provided
- Aligned with ESRS disclosure requirements and double materiality principles
- Written in third person ("The undertaking has..." not "We have...")
- Concise but comprehensive (2-4 paragraphs for narratives, 1-2 sentences for commentary)`;

export interface VarianceCommentaryDto {
  metricCode: string;
  currentValue: number;
  priorValue: number;
  variancePct: number;
}

export interface NarrativeDto {
  standardCode: string;
  standardName: string;
  dataPoints: Array<{ metricCode: string; metricName: string; value: number; unit: string }>;
  additionalContext?: string;
}

@Injectable()
export class AiService {
  constructor(
    @Inject(AI_PROVIDER) private readonly provider: IAiProvider,
    private readonly db: TenantAwareService,
  ) {}

  async generateVarianceCommentary(dto: VarianceCommentaryDto): Promise<{ text: string }> {
    const def = getMetricByCode(dto.metricCode);
    const direction = dto.variancePct > 0 ? 'increased' : 'decreased';

    const userPrompt = `Generate a brief variance commentary for the following ESRS metric change:

Metric: ${def?.name || dto.metricCode} (${def?.standardCode || 'unknown'})
Current period value: ${dto.currentValue.toLocaleString()} ${def?.unit || ''}
Prior period value: ${dto.priorValue.toLocaleString()} ${def?.unit || ''}
Change: ${direction} by ${Math.abs(dto.variancePct).toFixed(1)}%

Provide a plausible 1-2 sentence explanation for this change that would be suitable for inclusion in an ESRS sustainability report. Reference potential operational, market, or regulatory factors.`;

    const response = await this.provider.generateText({
      systemPrompt: ESG_SYSTEM_PROMPT,
      userPrompt,
      maxTokens: 200,
    });

    await this.logRequest('variance_commentary', response.model, response.promptTokens, response.completionTokens, { metricCode: dto.metricCode }, response.text);

    return { text: response.text };
  }

  async synthesizeNarrative(dto: NarrativeDto): Promise<{ text: string }> {
    const dataPointsSummary = dto.dataPoints
      .map((dp) => `- ${dp.metricName}: ${dp.value.toLocaleString()} ${dp.unit}`)
      .join('\n');

    const userPrompt = `Generate an ESRS disclosure narrative for the following standard:

Standard: ${dto.standardCode} — ${dto.standardName}

Key data points for this reporting period:
${dataPointsSummary}

${dto.additionalContext ? `Additional context: ${dto.additionalContext}` : ''}

Write a comprehensive disclosure narrative (2-4 paragraphs) that:
1. Describes the undertaking's policies and approach to this topic
2. References the quantitative data points provided
3. Discusses targets, actions taken, and progress
4. Meets ESRS disclosure requirements for ${dto.standardCode}`;

    const response = await this.provider.generateText({
      systemPrompt: ESG_SYSTEM_PROMPT,
      userPrompt,
      maxTokens: 1000,
    });

    await this.logRequest('narrative_synthesis', response.model, response.promptTokens, response.completionTokens, { standardCode: dto.standardCode }, response.text);

    return { text: response.text };
  }

  private async logRequest(
    requestType: string,
    model: string,
    promptTokens: number,
    completionTokens: number,
    inputContext: Record<string, unknown>,
    outputText: string,
  ): Promise<void> {
    try {
      await this.db.query(
        `INSERT INTO ai_requests (request_type, model, prompt_tokens, completion_tokens, total_tokens, input_context, output_text)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [requestType, model, promptTokens, completionTokens, promptTokens + completionTokens, JSON.stringify(inputContext), outputText],
      );
    } catch {
      // Don't fail the request if logging fails
    }
  }
}
