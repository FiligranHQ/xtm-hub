import { Restriction } from '../src/__generated__/resolvers-types';

import { PortalContext } from '../src/model/portal-context';
import {
  ADMIN_UUID,
  CAPABILITY_BYPASS,
  PLATFORM_ORGANIZATION_UUID,
  ROLE_ADMIN,
} from '../src/portal.const';

export const DEFAULT_ADMIN_EMAIL = 'admin@filigran.io';
export const DEFAULT_ADMIN_PASSWORD = 'admin';
export const SIMPLE_USER_FILIGRAN_ID = 'e389e507-f1cd-4f2f-bfb2-274140d87d28';
export const DEFAULT_ORG = 'Filigran';

export const THALES_ORGA_ID = '681fb117-e2c3-46d3-945a-0e921b5d4b6c';
export const THALES_USER_ID = '015c0488-848d-4c89-95e3-8a243971f594';
export const SERVICE_MALWARE_ID = '234a5d21-8a1f-4d3f-8f57-7fd21c321bd4';
export const SERVICE_VAULT_ID = 'e88e8f80-ba9e-480b-ab27-8613a1565eff';

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
  serviceInstanceId: 'c6343882-f609-4a3f-abe0-a34f8cb11302',
} as PortalContext;

export const contextAdminOrgaThales: PortalContext = {
  user: {
    id: THALES_USER_ID,
    email: 'admin@thales.com',
    password: null,
    salt: null,
    first_name: null,
    last_name: null,
    selected_organization_id: THALES_ORGA_ID,
    organizations: [
      {
        id: THALES_ORGA_ID,
        name: 'Thales',
        personal_space: false,
        domains: ['thales.com'],
      },
      {
        id: THALES_USER_ID,
        name: 'admin@thales.com',
        personal_space: true,
        domains: [],
      },
    ],
    capabilities: [],
    roles_portal: [
      {
        ...ROLE_ADMIN,
      },
    ],
  },
} as PortalContext;
