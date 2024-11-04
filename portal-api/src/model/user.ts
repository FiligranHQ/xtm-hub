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
  organizations: (Pick<Organization, 'id' | 'name'> & {
    selected: boolean;
    __typename: 'Organization';
  })[];
  roles_portal_id: (Pick<RolePortal, 'id'> & { __typename: 'RolePortal' })[];
  capabilities: Pick<CapabilityPortal, 'id' | 'name'>[];
}

export interface UserWithOrganizations extends User {
  organizations: (Pick<Organization, 'id' | 'name'> & {
    __typename: 'Organization';
  })[];
}
