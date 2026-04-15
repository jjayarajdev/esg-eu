import { Module } from '@nestjs/common';
import { ReportingPeriodService } from './services/reporting-period.service';
import { MetricValueService } from './services/metric-value.service';
import { ReportingPeriodController } from './api/controllers/reporting-period.controller';
import { DataPointController } from './api/controllers/data-point.controller';

@Module({
  providers: [ReportingPeriodService, MetricValueService],
  controllers: [ReportingPeriodController, DataPointController],
  exports: [ReportingPeriodService, MetricValueService],
})
export class DataCollectionModule {}
