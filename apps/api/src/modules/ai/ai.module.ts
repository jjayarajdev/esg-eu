import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AI_PROVIDER } from './providers/ai-provider.port';
import { MockAiProvider } from './providers/mock-ai.provider';
import { OpenAiProvider } from './providers/openai.provider';
import { AiService } from './services/ai.service';
import { AiController } from './api/controllers/ai.controller';

@Module({
  providers: [
    {
      provide: AI_PROVIDER,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const provider = config.get<string>('AI_PROVIDER', 'mock');
        if (provider === 'openai') {
          return new OpenAiProvider(config);
        }
        return new MockAiProvider();
      },
    },
    AiService,
  ],
  controllers: [AiController],
  exports: [AiService],
})
export class AiModule {}
