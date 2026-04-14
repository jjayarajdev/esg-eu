import { v4 as uuidv4 } from 'uuid';

/**
 * Base class for all domain events.
 * Every event carries tenant context and a unique ID for idempotency.
 *
 * Modules define their own event classes extending this:
 *   class DmaCompleted extends DomainEvent { ... }
 *
 * Events are published via the IEventBus and persisted to an outbox table
 * for reliability and future microservice extraction.
 */
export abstract class DomainEvent {
  /** Unique event ID (UUID v4) */
  readonly eventId: string;

  /** When the event occurred */
  readonly occurredAt: Date;

  /** Tenant that this event belongs to */
  readonly tenantId: string;

  /** User who triggered the action */
  readonly userId: string;

  /** Discriminator for event type — must be unique per event class */
  abstract readonly eventType: string;

  constructor(tenantId: string, userId: string) {
    this.eventId = uuidv4();
    this.occurredAt = new Date();
    this.tenantId = tenantId;
    this.userId = userId;
  }

  /** Serialize for outbox storage and cross-service transport */
  toJSON(): Record<string, unknown> {
    return {
      eventId: this.eventId,
      eventType: this.eventType,
      occurredAt: this.occurredAt.toISOString(),
      tenantId: this.tenantId,
      userId: this.userId,
      payload: this.getPayload(),
    };
  }

  /** Override in subclasses to include event-specific data */
  protected abstract getPayload(): Record<string, unknown>;
}
