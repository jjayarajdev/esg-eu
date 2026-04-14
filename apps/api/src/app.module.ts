import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './infrastructure/health/health.module';

/**
 * Root application module.
 * Composes all domain modules and infrastructure.
 *
 * Domain modules will be added here as they are built:
 *   Phase 1: TenantModule, DataCollectionModule, ConnectorModule, ApprovalWorkflowModule
 *   Phase 2: ReportingModule, XbrlModule
 *   Phase 3: DmaModule
 *   Phase 4: AiModule
 *   Phase 5: TaxonomyAlignmentModule, SfdrModule
 */
@Module({
  imports: [
    // Global config from environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Health check endpoint
    HealthModule,

    // Domain modules (added as built)
    // TenantModule,
    // DataCollectionModule,
    // ConnectorModule,
    // ApprovalWorkflowModule,
    // ReportingModule,
    // XbrlModule,
    // DmaModule,
    // AiModule,
    // TaxonomyAlignmentModule,
    // SfdrModule,
  ],
})
export class AppModule {}
