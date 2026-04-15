import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../../../../infrastructure/auth/auth.guard';
import { SupplyChainService, CreateCampaignDto, InviteSupplierDto, SubmitDataDto } from '../../services/supply-chain.service';

@ApiTags('supply-chain')
@Controller('supply-chain')
export class SupplyChainController {
  constructor(private readonly service: SupplyChainService) {}

  // Enterprise endpoints (require auth)
  @Post('campaigns')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create supplier data collection campaign' })
  async createCampaign(@Body() dto: CreateCampaignDto) {
    return { data: await this.service.createCampaign(dto) };
  }

  @Get('campaigns')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List campaigns' })
  async listCampaigns() { return { data: await this.service.listCampaigns() }; }

  @Get('campaigns/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get campaign with supplier status' })
  async getCampaign(@Param('id') id: string) { return { data: await this.service.getCampaign(id) }; }

  @Post('campaigns/:id/invite')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Invite a supplier to submit data' })
  async inviteSupplier(@Param('id') id: string, @Body() dto: InviteSupplierDto) {
    return { data: await this.service.inviteSupplier(id, dto) };
  }

  // Supplier portal endpoints (PUBLIC — token-based auth)
  @Get('portal/:token')
  @ApiOperation({ summary: 'Get supplier portal form (public, token-based)' })
  async getPortal(@Param('token') token: string) {
    return { data: await this.service.getPortalData(token) };
  }

  @Post('portal/:token/submit')
  @ApiOperation({ summary: 'Submit supplier ESG data (public, token-based)' })
  async submitPortal(@Param('token') token: string, @Body() dto: SubmitDataDto) {
    return { data: await this.service.submitPortalData(token, dto) };
  }
}
