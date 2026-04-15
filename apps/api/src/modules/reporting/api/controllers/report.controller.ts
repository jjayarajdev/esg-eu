import { Controller, Get, Post, Put, Body, Param, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthGuard } from '../../../../infrastructure/auth/auth.guard';
import { ReportService, CreateReportDto } from '../../services/report.service';

@ApiTags('reports')
@Controller('reports')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class ReportController {
  constructor(private readonly service: ReportService) {}

  @Post()
  @ApiOperation({ summary: 'Create report from DMA material topics' })
  async create(@Body() dto: CreateReportDto) {
    const report = await this.service.create(dto);
    return { data: report };
  }

  @Get()
  @ApiOperation({ summary: 'List all reports' })
  async list() {
    const reports = await this.service.list();
    return { data: reports };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get report with all sections' })
  async findById(@Param('id') id: string) {
    const report = await this.service.findById(id);
    return { data: report };
  }

  @Post(':id/generate')
  @ApiOperation({ summary: 'Generate all sections with AI narratives' })
  async generateFull(@Param('id') id: string) {
    const report = await this.service.generateFullReport(id);
    return { data: report };
  }

  @Post(':id/sections/:standardCode/generate')
  @ApiOperation({ summary: 'Generate AI narrative for one section' })
  async generateSection(
    @Param('id') id: string,
    @Param('standardCode') standardCode: string,
  ) {
    const section = await this.service.generateSection(id, standardCode);
    return { data: section };
  }

  @Put(':id/sections/:standardCode')
  @ApiOperation({ summary: 'Edit section narrative manually' })
  async updateSection(
    @Param('id') id: string,
    @Param('standardCode') standardCode: string,
    @Body() body: { narrative: string },
  ) {
    const section = await this.service.updateSectionNarrative(id, standardCode, body.narrative);
    return { data: section };
  }

  @Post(':id/finalize')
  @ApiOperation({ summary: 'Finalize report for XBRL generation' })
  async finalize(@Param('id') id: string) {
    const report = await this.service.finalize(id);
    return { data: report };
  }

  @Get(':id/export/html')
  @ApiOperation({ summary: 'Export report as styled HTML' })
  async exportHtml(@Param('id') id: string, @Res() res: Response) {
    const html = await this.service.exportHtml(id);
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `inline; filename="esrs-report-${id}.html"`);
    res.send(html);
  }
}
