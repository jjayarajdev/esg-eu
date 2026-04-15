/**
 * AI provider interface — abstraction over OpenAI, Claude, or mock.
 * Selected via AI_PROVIDER env var.
 */
export interface IAiProvider {
  generateText(params: {
    systemPrompt: string;
    userPrompt: string;
    maxTokens?: number;
  }): Promise<AiResponse>;
}

export interface AiResponse {
  text: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export const AI_PROVIDER = Symbol('AI_PROVIDER');
