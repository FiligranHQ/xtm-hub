import CapabilityPortal from './kanel/public/CapabilityPortal';
import Organization from './kanel/public/Organization';
import { RolePortalId } from './kanel/public/RolePortal';
import User from './kanel/public/User';

export interface UserInfo {
  email: string;
  first_name: string;
  last_name: string;
  roles: string[];
}

export interface UserLoadUserBy extends User {
  organizations: (Organization & {
    selected: boolean;
    __typename: 'Organization';
  })[];
  roles_portal_id: {
    id: RolePortalId;
    __typename: 'RolePortalID';
  }[];
  capabilities: CapabilityPortal[];
}

export interface UserWithOrganizationsAndRole extends User {
  organizations: (Organization & {
    __typename: 'Organization';
  })[];
  roles_portal_id: {
    id: RolePortalId;
    __typename: 'RolePortalID';
  }[];
}
