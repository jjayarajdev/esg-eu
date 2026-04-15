import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../../../../infrastructure/auth/auth.guard';
import { ConnectorService } from '../../services/connector.service';

@ApiTags('connectors')
@Controller()
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class ConnectorController {
  constructor(private readonly service: ConnectorService) {}

  @Get('connectors')
  @ApiOperation({ summary: 'List available connector types' })
  listAdapters() {
    return { data: this.service.getAvailableAdapters() };
  }

  @Post('ingest/:connectorType')
  @ApiOperation({ summary: 'Push data from a source system' })
  async ingest(
    @Param('connectorType') connectorType: string,
    @Body() body: { reportingPeriodId: string; payload: unknown },
  ) {
    const result = await this.service.ingest(
      connectorType,
      body.reportingPeriodId,
      body.payload,
    );
    return { data: result };
  }

  @Get('connectors/runs')
  @ApiOperation({ summary: 'Get ingestion run history' })
  async getRunHistory(@Query('connectorType') connectorType?: string) {
    const runs = await this.service.getRunHistory(connectorType);
    return { data: runs };
  }
}
