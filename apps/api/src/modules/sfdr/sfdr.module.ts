import { Module } from '@nestjs/common';
import { SfdrService } from './services/sfdr.service';
import { SfdrController } from './api/controllers/sfdr.controller';

@Module({
  providers: [SfdrService],
  controllers: [SfdrController],
  exports: [SfdrService],
})
export class SfdrModule {}
