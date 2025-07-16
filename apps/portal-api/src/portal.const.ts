import { Restriction } from './__generated__/resolvers-types';
import CapabilityPortal, {
  CapabilityPortalId,
} from './model/kanel/public/CapabilityPortal';
import { OrganizationId } from './model/kanel/public/Organization';
import RolePortal, { RolePortalId } from './model/kanel/public/RolePortal';
import { UserId } from './model/kanel/public/User';

export const ADMIN_UUID: UserId =
  'ba091095-418f-4b4f-b150-6c9295e232c3' as UserId;
export const PLATFORM_ORGANIZATION_UUID: OrganizationId =
  'ba091095-418f-4b4f-b150-6c9295e232c4' as OrganizationId;
export const CAPABILITY_BYPASS: CapabilityPortal = {
  id: '85c9fe6f-901f-4992-a8aa-b8d56a7e2e09' as CapabilityPortalId,
  name: Restriction.Bypass,
};
export const CAPABILITY_BCK_MANAGE_SERVICES = {
  id: '6ff7515e-5d86-49e8-84b6-f301d12e6038',
  name: Restriction.ManageSubscription,
};
export const CAPABILITY_FRT_SERVICE_SUBSCRIBER = {
  id: '993b2b86-2310-47e9-90f2-b56ad9b15405',
  name: Restriction.FrtServiceSubscriber,
};
export const ROLE_ADMIN: RolePortal = {
  id: '6b632cf2-9105-46ec-a463-ad59ab58c770' as RolePortalId,
  name: 'ADMIN',
};
export const ROLE_ADMIN_ORGA: RolePortal = {
  id: '40cfe630-c272-42f9-8fcf-f219e2f4278c' as RolePortalId,
  name: 'ADMIN_ORGA',
};

export const JOIN_TYPE = {
  JOIN_INVITE: 'JOIN_INVITE',
  JOIN_ASK: 'JOIN_ASK',
  JOIN_AUTO: 'JOIN_AUTO',
  JOIN_SELF: 'JOIN_SELF',
};
