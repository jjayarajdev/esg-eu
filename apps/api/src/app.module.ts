import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './infrastructure/health/health.module';
import { DatabaseModule } from './infrastructure/database/database.module';
import { AppClsModule } from './infrastructure/cls/cls.module';
import { EventBusModule } from './infrastructure/events/event-bus.module';
import { AuditModule } from './infrastructure/audit/audit.module';
import { MockAuthMiddleware } from './infrastructure/auth/mock-auth.middleware';
import { TenantModule } from './modules/tenant/tenant.module';
import { DataCollectionModule } from './modules/data-collection/data-collection.module';
import { ApprovalWorkflowModule } from './modules/approval-workflow/approval-workflow.module';
import { ConnectorModule } from './modules/connector/connector.module';
import { DmaModule } from './modules/dma/dma.module';
import { AiModule } from './modules/ai/ai.module';
import { ReportingModule } from './modules/reporting/reporting.module';
import { XbrlModule } from './modules/xbrl/xbrl.module';
import { TaxonomyModule } from './modules/taxonomy/taxonomy.module';
import { SupplyChainModule } from './modules/supply-chain/supply-chain.module';
import { SfdrModule } from './modules/sfdr/sfdr.module';

/**
 * Root application module.
 * Composes infrastructure and domain modules.
 */
@Module({
  imports: [
    // Global config from environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Infrastructure (Wave 1)
    AppClsModule,
    DatabaseModule,
    EventBusModule,
    AuditModule,

    // Health check
    HealthModule,

    // Domain modules
    TenantModule,
    DataCollectionModule,
    ApprovalWorkflowModule,
    ConnectorModule,
    DmaModule,
    AiModule,
    ReportingModule,
    XbrlModule,
    TaxonomyModule,
    SupplyChainModule,
    SfdrModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply mock auth to all routes except health and tenant creation
    consumer
      .apply(MockAuthMiddleware)
      .exclude('health', 'api/v1/health')
      .forRoutes('*');
  }
}
