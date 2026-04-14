// @esg/shared-kernel — Public API

// Domain types shared across modules
export * from './types';

// Standardized error hierarchy
export * from './errors';

// Multi-tenancy: tenant context, schema routing
export * from './multitenancy';

// Audit trail types
export * from './audit';

// Domain event bus abstraction
export * from './events';

// Base entity and database utilities
export * from './database';

// Shared validation schemas (Zod)
export * from './validation';
