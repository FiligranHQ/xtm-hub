import User from './kanel/public/User';
import Organization from './kanel/public/Organization';
import RolePortal from './kanel/public/RolePortal';
import CapabilityPortal from './kanel/public/CapabilityPortal';

export interface UserLoadUserBy extends User {
  organizations: (Pick<Organization, 'id' | 'name'> & {
    __typename: 'Organization';
  })[];
  roles_portal_id: (Pick<RolePortal, 'id'> & { __typename: 'RolePortal' })[];
  capabilities: Pick<CapabilityPortal, 'id' | 'name'>[];
}
