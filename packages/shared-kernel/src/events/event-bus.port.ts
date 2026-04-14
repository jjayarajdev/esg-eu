import type { DomainEvent } from './domain-event';

/**
 * Event handler function signature.
 * Modules register handlers that react to domain events from other modules.
 */
export type EventHandler<T extends DomainEvent> = (event: T) => Promise<void>;

/**
 * Event bus port — the abstraction for inter-module communication.
 *
 * In-process implementation: EventEmitter2 (monolith mode).
 * Future extraction: SQS/SNS (microservice mode).
 *
 * The interface stays identical — only the implementation changes.
 *
 * All published events are also written to a transactional outbox table
 * so they are never lost and can be replayed for:
 *   1. Failed subscriber recovery
 *   2. Microservice event relay
 *   3. Debugging and audit trail
 */
export interface IEventBus {
  /**
   * Publish a domain event. All registered handlers are invoked.
   * The event is also persisted to the outbox table within the current
   * database transaction (if one is active).
   */
  publish<T extends DomainEvent>(event: T): Promise<void>;

  /**
   * Subscribe a handler to a specific event type.
   * The eventType string must match the event class's eventType property.
   *
   * @param eventType - The event type discriminator string
   * @param handler - Async function to handle the event
   */
  subscribe<T extends DomainEvent>(
    eventType: string,
    handler: EventHandler<T>,
  ): void;

  /**
   * Publish multiple events atomically.
   * Used when a single operation produces multiple events
   * (e.g., DMA finalization emits DmaCompleted + multiple topic events).
   */
  publishAll(events: DomainEvent[]): Promise<void>;
}

/** Injection token for the event bus */
export const EVENT_BUS = Symbol('EVENT_BUS');
