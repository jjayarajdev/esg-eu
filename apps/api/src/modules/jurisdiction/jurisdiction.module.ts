import { Module } from '@nestjs/common';
import { JurisdictionController } from './jurisdiction.controller';

@Module({
  controllers: [JurisdictionController],
})
export class JurisdictionModule {}
