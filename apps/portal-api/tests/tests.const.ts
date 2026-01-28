import { OrganizationId } from '../src/model/kanel/public/Organization';
import { ServiceCapabilityId } from '../src/model/kanel/public/ServiceCapability';
import { ServiceDefinitionId } from '../src/model/kanel/public/ServiceDefinition';
import { ServiceInstanceId } from '../src/model/kanel/public/ServiceInstance';
import { UserId } from '../src/model/kanel/public/User';
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
export const ADMIN_USER_ID = 'ba091095-418f-4b4f-b150-6c9295e232c3' as UserId;
export const DEFAULT_ORG = 'Filigran';
export const FILIGRAN_ORGA_ID =
  'ba091095-418f-4b4f-b150-6c9295e232c4' as OrganizationId;

export const THALES_ORGA_ID =
  '681fb117-e2c3-46d3-945a-0e921b5d4b6c' as OrganizationId;
export const THALES_ADMIN_ORGA_PERSONAL_SPACE_ID =
  '015c0488-848d-4c89-95e3-8a243971f594' as OrganizationId;
export const THALES_ADMIN_ORGA_USER_ID =
  THALES_ADMIN_ORGA_PERSONAL_SPACE_ID as unknown as UserId;
export const THALES_ADMIN_ORGA_EMAIL = 'admin@thales.com';
export const SERVICE_MALWARE_ID = '234a5d21-8a1f-4d3f-8f57-7fd21c321bd4';
export const SERVICE_VAULT_ID =
  'e88e8f80-ba9e-480b-ab27-8613a1565eff' as ServiceInstanceId;
export const SERVICE_INTEGRATIONS_ID =
  'ad003d3f-c406-4be8-a650-880d72f952e9' as ServiceInstanceId;
export const SERVICE_OPENAEV_SCENARIOS_ID =
  'f61ee5ca-4b4f-4f94-9cb7-69b1b1c885a2' as ServiceInstanceId;
export const SERVICE_CUSTOM_DASHBOARDS_ID =
  'e1fb0d3f-a090-41c7-b183-8d949f6c2ba4' as ServiceInstanceId;
export const SERVICE_OPENCTI_REGISTRATION =
  '6c837a7d-2821-4c3d-9479-d3e7fa02f0cb' as ServiceDefinitionId;
export const THALES_SIMPLE_USER_ID =
  '154006e2-f24b-42da-b39c-e0fb17bead00' as UserId;
export const THALES_SIMPLE_USER_EMAIL = 'user@thales.com';
export const FILIGRAN_USER_ID =
  '77b4b845-4ab4-4df8-8e12-0651da813ebb' as UserId;
export const INTEGRATION_SERVICE_CAPABILITY_UPLOAD =
  '26611d56-e443-45fb-9f6c-cc6b9b8a5de9' as ServiceCapabilityId;
export const INTEGRATION_SERVICE_CAPABILITY_DELETE =
  '283e06b2-2d64-42c7-b432-890e69ac8b8f' as ServiceCapabilityId;

export const contextAdminUser: PortalContext = {
  user: {
    id: ADMIN_UUID,
    email: DEFAULT_ADMIN_EMAIL,
    password: null,
    salt: null,
    first_name: 'firstName',
    last_name: 'lastName',
    selected_organization_id: PLATFORM_ORGANIZATION_UUID,
    organizations: [
      {
        id: PLATFORM_ORGANIZATION_UUID,
        name: DEFAULT_ORG,
        personal_space: false,
        domains: [],
      },
    ],
    capabilities: [CAPABILITY_BYPASS],
    roles_portal: [
      {
        ...ROLE_ADMIN,
      },
    ],
  },
} as PortalContext;

export const requestContextAdminUser = {
  user: contextAdminUser.user,
  portalContext: contextAdminUser,
};

export const contextAdminOrgaThales: PortalContext = {
  user: {
    id: THALES_ADMIN_ORGA_USER_ID,
    email: THALES_ADMIN_ORGA_EMAIL,
    password: null,
    salt: null,
    first_name: null,
    last_name: null,
    selected_organization_id: THALES_ORGA_ID,
    selected_org_capabilities: ['ADMINISTRATE_ORGANIZATION'],
    organizations: [
      {
        id: THALES_ORGA_ID,
        name: 'Thales',
        personal_space: false,
        domains: ['thales.com'],
      },
      {
        id: THALES_ADMIN_ORGA_PERSONAL_SPACE_ID,
        name: THALES_ADMIN_ORGA_EMAIL,
        personal_space: true,
        domains: [],
      },
    ],
    capabilities: [],
    organization_capabilities: [
      {
        id: 12,
        organization: THALES_ORGA_ID,
        capabilities: ['ADMINISTRATE_ORGANIZATION'],
      },
      {
        id: 13,
        organization: THALES_ADMIN_ORGA_PERSONAL_SPACE_ID,
        capabilities: ['ADMINISTRATE_ORGANIZATION'],
      },
    ],
    roles_portal: [],
  },
} as unknown as PortalContext;

export const requestContextThalesUser = {
  user: contextAdminOrgaThales.user,
  portalContext: contextAdminOrgaThales,
};

export const contextSimpleUserThales: PortalContext = {
  user: {
    id: THALES_SIMPLE_USER_ID,
    email: THALES_SIMPLE_USER_EMAIL,
    password: null,
    salt: null,
    first_name: 'thalesUserFirstName',
    last_name: 'thalesUserLastName',
    selected_organization_id: THALES_ORGA_ID,
    organizations: [
      {
        id: THALES_ORGA_ID,
        name: 'Thales',
        personal_space: false,
        domains: ['thales.com'],
      },
      {
        id: THALES_ADMIN_ORGA_PERSONAL_SPACE_ID,
        name: THALES_SIMPLE_USER_EMAIL,
        personal_space: true,
        domains: [],
      },
    ],
    capabilities: [],
    roles_portal: [],
  },
} as PortalContext;

export const requestContextSimpleUserThales = {
  user: contextSimpleUserThales.user,
  portalContext: contextSimpleUserThales,
};
