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
  name: Restriction.BckManageServices,
};
export const CAPABILITY_FRT_SERVICE_SUBSCRIBER = {
  id: '993b2b86-2310-47e9-90f2-b56ad9b15405',
  name: Restriction.FrtServiceSubscriber,
};
export const CAPABILITY_FRT_MANAGE_SETTINGS = {
  id: 'cabbc09c-275a-473b-b490-626b9ebf6939',
  name: Restriction.FrtManageSettings,
};
export const CAPABILITY_FRT_MANAGE_USER: CapabilityPortal = {
  id: '350d67fe-5a9b-4b51-8d63-ad504d8a4999' as CapabilityPortalId,
  name: Restriction.FrtManageUser,
};
export const CAPABILITY_FRT_ACCESS_BILLING = {
  id: 'd583993e-2cb7-4fe9-ba47-2100ca7ae54f',
  name: Restriction.FrtAccessBilling,
};
export const CAPABILITY_FRT_ACCESS_SERVICES = {
  id: 'fe5ad46d-8851-4d8f-901b-4dfb5e738df5',
  name: Restriction.FrtAccessServices,
};
export const CAPABILITY_FRT_SERVICE_SELF_SUBSCRIBER: CapabilityPortal = {
  id: '0b23ea67-e944-43f5-a397-9022f4f0cc76' as CapabilityPortalId,
  name: Restriction.FrtServiceSelfSubscriber,
};
export const ROLE_ADMIN: RolePortal = {
  id: '6b632cf2-9105-46ec-a463-ad59ab58c770' as RolePortalId,
  name: 'ADMIN',
};
export const ROLE_USER: RolePortal = {
  id: '40cfe630-c272-42f9-8fcf-f219e2f4277b' as RolePortalId,
  name: 'USER',
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
