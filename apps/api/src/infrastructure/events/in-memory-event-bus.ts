import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from 'eventemitter2';
import type { DomainEvent, IEventBus, EventHandler } from '@esg/shared-kernel';

/**
 * In-process event bus implementation using EventEmitter2.
 * Used in monolith mode. For microservice extraction, swap with
 * an SQS/SNS implementation of the same IEventBus interface.
 */
@Injectable()
export class InMemoryEventBus implements IEventBus {
  private readonly emitter = new EventEmitter2({
    wildcard: false,
    maxListeners: 50,
  });

  async publish<T extends DomainEvent>(event: T): Promise<void> {
    this.emitter.emit(event.eventType, event);
  }

  subscribe<T extends DomainEvent>(
    eventType: string,
    handler: EventHandler<T>,
  ): void {
    this.emitter.on(eventType, handler);
  }

  async publishAll(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.publish(event);
    }
  }
}
