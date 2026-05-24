export { Role } from '@nexora/shared-types';
import { Role } from '@nexora/shared-types';

export const ROLE_HIERARCHY: Record<Role, number> = {
  [Role.SUPER_ADMIN]: 100,
  [Role.TENANT_ADMIN]: 80,
  [Role.STORE_OWNER]: 75,
  [Role.MANAGER]: 60,
  [Role.STAFF]: 50,
  [Role.CUSTOMER]: 10,
};
