import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import type { IAiProvider, AiResponse } from './ai-provider.port';

@Injectable()
export class OpenAiProvider implements IAiProvider {
  private client: OpenAI;
  private model: string;

  constructor(private readonly config: ConfigService) {
    this.client = new OpenAI({
      apiKey: config.get<string>('OPENAI_API_KEY', ''),
    });
    this.model = config.get<string>('OPENAI_MODEL', 'gpt-4o-mini');
  }

  async generateText(params: {
    systemPrompt: string;
    userPrompt: string;
    maxTokens?: number;
  }): Promise<AiResponse> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: params.systemPrompt },
        { role: 'user', content: params.userPrompt },
      ],
      max_tokens: params.maxTokens || 1000,
      temperature: 0.3,
    });

    const choice = response.choices[0];
    const usage = response.usage;

    return {
      text: choice?.message?.content || '',
      model: response.model,
      promptTokens: usage?.prompt_tokens || 0,
      completionTokens: usage?.completion_tokens || 0,
      totalTokens: usage?.total_tokens || 0,
    };
  }
}
