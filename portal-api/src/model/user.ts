import CapabilityPortal from './kanel/public/CapabilityPortal';
import Organization from './kanel/public/Organization';
import RolePortal from './kanel/public/RolePortal';
import User from './kanel/public/User';

export interface UserInfo {
  email: string;
  first_name: string;
  last_name: string;
  roles: string[];
}

export interface UserLoadUserBy extends User {
  organizations: Organization[];
  roles_portal: RolePortal[];
  capabilities: CapabilityPortal[];
}

export interface UserWithOrganizationsAndRole extends User {
  organizations: Organization[];
  roles_portal: RolePortal[];
}
