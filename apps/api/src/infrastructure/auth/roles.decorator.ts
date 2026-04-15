import { SetMetadata } from '@nestjs/common';
import type { UserRole } from '@esg/shared-kernel';

export const ROLES_KEY = 'roles';

/**
 * Decorator to restrict endpoint access to specific roles.
 * Usage: @Roles('admin', 'data_owner')
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
