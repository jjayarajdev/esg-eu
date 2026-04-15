import { Global, Module } from '@nestjs/common';
import { ClsModule } from 'nestjs-cls';

/**
 * Continuation-Local Storage module.
 * Stores ITenantContext per request so any service can access
 * the current tenant without passing it through every function call.
 */
@Global()
@Module({
  imports: [
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
      },
    }),
  ],
})
export class AppClsModule {}
