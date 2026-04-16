import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../../../../infrastructure/auth/auth.guard';
import { SfdrService, CreateFundDto } from '../../services/sfdr.service';

@ApiTags('sfdr')
@Controller('sfdr')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class SfdrController {
  constructor(private readonly service: SfdrService) {}

  @Get('pai-indicators')
  @ApiOperation({ summary: 'Get 14 mandatory PAI indicators' })
  getPaiIndicators() { return { data: this.service.getPaiIndicators() }; }

  @Get('classifications')
  @ApiOperation({ summary: 'Get SFDR fund classification options (Art 6/8/9)' })
  getClassifications() { return { data: this.service.getFundClassifications() }; }

  @Post('funds')
  @ApiOperation({ summary: 'Create a financial product/fund for SFDR reporting' })
  async createFund(@Body() dto: CreateFundDto) { return { data: await this.service.createFund(dto) }; }

  @Get('funds')
  @ApiOperation({ summary: 'List SFDR funds' })
  async listFunds() { return { data: await this.service.listFunds() }; }

  @Get('funds/:id')
  @ApiOperation({ summary: 'Get fund with PAI values' })
  async getFund(@Param('id') id: string) { return { data: await this.service.getFund(id) }; }

  @Put('funds/:id/pai/:paiId')
  @ApiOperation({ summary: 'Update a PAI indicator value for a fund' })
  async updatePai(@Param('id') id: string, @Param('paiId') paiId: string, @Body() body: { value: number }) {
    return { data: await this.service.updatePaiValue(id, paiId, body.value) };
  }
}
