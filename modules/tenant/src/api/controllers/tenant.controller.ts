import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ClsService } from 'nestjs-cls';
import type { ITenantContext } from '@esg/shared-kernel';
import { TenantService, CreateTenantDto } from '../../tenant.service';

@ApiTags('tenants')
@Controller('tenants')
export class TenantController {
  constructor(
    private readonly tenantService: TenantService,
    private readonly cls: ClsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new tenant (provisions isolated schema)' })
  async create(@Body() dto: CreateTenantDto) {
    const tenant = await this.tenantService.create(dto);
    return { data: tenant };
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current tenant profile' })
  async getMe() {
    const ctx = this.cls.get<ITenantContext>('tenantContext');
    if (!ctx) {
      return { data: null };
    }
    const tenant = await this.tenantService.findById(ctx.tenantId);
    return { data: tenant };
  }

  @Put('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current tenant profile' })
  async updateMe(@Body() dto: Partial<CreateTenantDto>) {
    const ctx = this.cls.get<ITenantContext>('tenantContext');
    if (!ctx) {
      return { data: null };
    }
    const tenant = await this.tenantService.update(ctx.tenantId, dto);
    return { data: tenant };
  }

  @Delete('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete tenant and all data (GDPR)' })
  async deleteMe() {
    const ctx = this.cls.get<ITenantContext>('tenantContext');
    if (!ctx) {
      return { message: 'No tenant context' };
    }
    await this.tenantService.delete(ctx.tenantId);
    return { message: 'Tenant deleted successfully' };
  }

  @Get()
  @ApiOperation({ summary: 'List all tenants (admin)' })
  async list() {
    const tenants = await this.tenantService.list();
    return { data: tenants };
  }
}
