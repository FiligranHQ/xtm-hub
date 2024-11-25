import { Restriction } from '../src/__generated__/resolvers-types';

import { PortalContext } from '../src/model/portal-context';
import {
  ADMIN_UUID,
  CAPABILITY_BYPASS,
  PLATFORM_ORGANIZATION_UUID,
  ROLE_ADMIN,
} from '../src/portal.const';

export const DEFAULT_ADMIN_EMAIL = 'admin@filigran.io';
export const DEFAULT_ORG = 'internal';

export const contextAdminUser: PortalContext = {
  user: {
    id: ADMIN_UUID,
    email: DEFAULT_ADMIN_EMAIL,
    password: null,
    salt: null,
    first_name: null,
    last_name: null,
    selected_organization_id: PLATFORM_ORGANIZATION_UUID,
    organizations: [
      {
        id: PLATFORM_ORGANIZATION_UUID,
        name: DEFAULT_ORG,
        personal_space: false,
        domains: [],
      },
    ],
    capabilities: [{ id: CAPABILITY_BYPASS.id, name: Restriction.Bypass }],
    roles_portal: [
      {
        ...ROLE_ADMIN,
      },
    ],
  },
  serviceId: 'c6343882-f609-4a3f-abe0-a34f8cb11302',
} as PortalContext;
