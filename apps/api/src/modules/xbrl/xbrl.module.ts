import { Module } from '@nestjs/common';
import { ReportingModule } from '../reporting/reporting.module';
import { XbrlService } from './services/xbrl.service';
import { XbrlController } from './api/controllers/xbrl.controller';

@Module({
  imports: [ReportingModule],
  providers: [XbrlService],
  controllers: [XbrlController],
  exports: [XbrlService],
})
export class XbrlModule {}
