import { Module } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { SchemaProvisioner } from './infrastructure/persistence/schema-provisioner';
import { TenantController } from './api/controllers/tenant.controller';

@Module({
  providers: [TenantService, SchemaProvisioner],
  controllers: [TenantController],
  exports: [TenantService],
})
export class TenantModule {}
