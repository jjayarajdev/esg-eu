import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../../../../infrastructure/auth/auth.guard';
import {
  ReportingPeriodService,
  CreateReportingPeriodDto,
} from '../../services/reporting-period.service';

@ApiTags('data')
@Controller('data/periods')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class ReportingPeriodController {
  constructor(private readonly service: ReportingPeriodService) {}

  @Post()
  @ApiOperation({ summary: 'Create a reporting period (e.g., FY 2024)' })
  async create(@Body() dto: CreateReportingPeriodDto) {
    const period = await this.service.create(dto);
    return { data: period };
  }

  @Get()
  @ApiOperation({ summary: 'List all reporting periods' })
  async list() {
    const periods = await this.service.list();
    return { data: periods };
  }
}
