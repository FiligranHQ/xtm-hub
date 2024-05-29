import { Restriction } from '../__generated__/resolvers-types';

export interface User {
  id: string;
  email: string;
  capabilities: { id: string, name: Restriction }[];
  organization_id: string;
  organization: { id: string, name?: string };
  roles_portal_id: RolePortal[];
}

export interface RolePortal {
  id: string;
  name?: string;
}

export interface UserInfo {
  email: string,
  first_name: string,
  last_name: string,
  roles: string[]
}
