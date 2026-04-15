import { Module } from '@nestjs/common';
import { ConnectorService } from './services/connector.service';
import { ConnectorController } from './api/controllers/connector.controller';

@Module({
  providers: [ConnectorService],
  controllers: [ConnectorController],
  exports: [ConnectorService],
})
export class ConnectorModule {}
