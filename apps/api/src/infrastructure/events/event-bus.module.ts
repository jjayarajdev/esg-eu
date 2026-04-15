import { Global, Module } from '@nestjs/common';
import { EVENT_BUS } from '@esg/shared-kernel';
import { InMemoryEventBus } from './in-memory-event-bus';

@Global()
@Module({
  providers: [
    {
      provide: EVENT_BUS,
      useClass: InMemoryEventBus,
    },
  ],
  exports: [EVENT_BUS],
})
export class EventBusModule {}
