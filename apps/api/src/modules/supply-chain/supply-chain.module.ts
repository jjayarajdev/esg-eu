import { Module } from '@nestjs/common';
import { SupplyChainService } from './services/supply-chain.service';
import { SupplyChainController } from './api/controllers/supply-chain.controller';

@Module({
  providers: [SupplyChainService],
  controllers: [SupplyChainController],
  exports: [SupplyChainService],
})
export class SupplyChainModule {}
