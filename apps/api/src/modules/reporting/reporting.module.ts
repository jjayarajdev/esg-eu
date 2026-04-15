import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { ReportService } from './services/report.service';
import { ReportController } from './api/controllers/report.controller';

@Module({
  imports: [AiModule],
  providers: [ReportService],
  controllers: [ReportController],
  exports: [ReportService],
})
export class ReportingModule {}
