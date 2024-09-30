import {
  ADMIN_UUID,
  CAPABILITY_BYPASS,
  PLATFORM_ORGANIZATION_UUID,
  ROLE_ADMIN,
} from '../src/portal.const';
import { Restriction } from '../src/__generated__/resolvers-types';

export const DEFAULT_ADMIN_EMAIL = 'admin@filigran.io';
export const DEFAULT_ORG = 'internal';

export const contextAdminUser = {
  user: {
    id: ADMIN_UUID,
    email: DEFAULT_ADMIN_EMAIL,
    first_name: null,
    last_name: null,
    organization_id: PLATFORM_ORGANIZATION_UUID,
    organization: {
      id: PLATFORM_ORGANIZATION_UUID,
      name: DEFAULT_ORG,
      __typename: 'Organization',
    },
    capabilities: [{ id: CAPABILITY_BYPASS, name: Restriction.Bypass }],
    roles_portal_id: [
      {
        id: ROLE_ADMIN,
        __typename: 'RolePortal',
      },
    ],
    __typename: 'User',
  },
};
