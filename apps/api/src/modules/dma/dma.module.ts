import { Module } from '@nestjs/common';
import { DmaAssessmentService } from './services/dma-assessment.service';
import { DmaController } from './api/controllers/dma.controller';

@Module({
  providers: [DmaAssessmentService],
  controllers: [DmaController],
  exports: [DmaAssessmentService],
})
export class DmaModule {}
