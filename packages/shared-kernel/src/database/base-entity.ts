/**
 * Base entity with standard columns.
 * All domain entities extend this to get consistent
 * id, timestamps, and created_by/updated_by tracking.
 */
export abstract class BaseEntity {
  /** UUID primary key */
  id!: string;

  /** When the entity was created */
  createdAt!: Date;

  /** When the entity was last updated */
  updatedAt!: Date;

  /** User who created the entity */
  createdBy!: string | null;

  /** User who last updated the entity */
  updatedBy!: string | null;
}
