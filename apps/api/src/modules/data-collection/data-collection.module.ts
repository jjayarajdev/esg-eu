import { Module } from '@nestjs/common';
import { ReportingPeriodService } from './services/reporting-period.service';
import { MetricValueService } from './services/metric-value.service';
import { EvidenceService } from './services/evidence.service';
import { ReportingPeriodController } from './api/controllers/reporting-period.controller';
import { DataPointController } from './api/controllers/data-point.controller';
import { EvidenceController } from './api/controllers/evidence.controller';

@Module({
  providers: [ReportingPeriodService, MetricValueService, EvidenceService],
  controllers: [ReportingPeriodController, DataPointController, EvidenceController],
  exports: [ReportingPeriodService, MetricValueService, EvidenceService],
})
export class DataCollectionModule {}
