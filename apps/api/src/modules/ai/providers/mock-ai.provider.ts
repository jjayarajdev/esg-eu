import { Injectable } from '@nestjs/common';
import type { IAiProvider, AiResponse } from './ai-provider.port';

@Injectable()
export class MockAiProvider implements IAiProvider {
  async generateText(params: {
    systemPrompt: string;
    userPrompt: string;
    maxTokens?: number;
  }): Promise<AiResponse> {
    // Generate template-based responses based on context clues
    const prompt = params.userPrompt.toLowerCase();
    let text: string;

    if (prompt.includes('variance') || prompt.includes('change')) {
      text = 'The year-over-year change in this metric is primarily attributable to operational improvements implemented during the reporting period. Management has undertaken targeted initiatives to optimize processes, resulting in measurable improvements across key performance indicators. Additional contributing factors include changes in market conditions and regulatory requirements that influenced operational decisions.';
    } else if (prompt.includes('narrative') || prompt.includes('disclosure')) {
      text = 'The undertaking has implemented comprehensive policies and procedures to address this sustainability matter. During the reporting period, material impacts have been identified, assessed, and managed through established governance frameworks. The organization maintains robust monitoring systems to track progress against targets and ensure compliance with applicable ESRS disclosure requirements. Stakeholder engagement processes have been conducted to validate the materiality assessment and inform strategic decision-making.';
    } else {
      text = 'Based on the available data and context, the analysis indicates alignment with regulatory requirements and organizational sustainability objectives. Further details are provided in the relevant disclosure sections of this report.';
    }

    return {
      text,
      model: 'mock-ai',
      promptTokens: params.userPrompt.length / 4,
      completionTokens: text.length / 4,
      totalTokens: (params.userPrompt.length + text.length) / 4,
    };
  }
}
