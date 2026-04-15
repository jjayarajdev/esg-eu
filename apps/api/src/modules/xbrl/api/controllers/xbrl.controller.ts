import { Controller, Get, Post, Param, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthGuard } from '../../../../infrastructure/auth/auth.guard';
import { XbrlService } from '../../services/xbrl.service';

@ApiTags('xbrl')
@Controller('xbrl')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class XbrlController {
  constructor(private readonly service: XbrlService) {}

  @Post('generate/:reportId')
  @ApiOperation({ summary: 'Generate iXBRL HTML from finalized report' })
  async generate(@Param('reportId') reportId: string) {
    const ixbrl = await this.service.generateIxbrl(reportId);
    return { data: { reportId, size: ixbrl.length, format: 'ixbrl-html' } };
  }

  @Get(':reportId')
  @ApiOperation({ summary: 'Download iXBRL HTML document' })
  async download(@Param('reportId') reportId: string, @Res() res: Response) {
    const ixbrl = await this.service.generateIxbrl(reportId);
    res.setHeader('Content-Type', 'application/xhtml+xml');
    res.setHeader('Content-Disposition', `attachment; filename="esrs-report-${reportId}.xhtml"`);
    res.send(ixbrl);
  }
}
