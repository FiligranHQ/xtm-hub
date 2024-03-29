import { Capability, Restriction } from './__generated__/resolvers-types';
import RolePortal, { RolePortalId } from './model/kanel/public/RolePortal';

export const ADMIN_UUID = 'ba091095-418f-4b4f-b150-6c9295e232c3';
export const PLATFORM_ORGANIZATION_UUID = 'ba091095-418f-4b4f-b150-6c9295e232c4';
export const CAPABILITY_BYPASS: Capability = { id: '85c9fe6f-901f-4992-a8aa-b8d56a7e2e09', name: Restriction.Bypass };
export const CAPABILITY_ADMIN: Capability = { id: 'e0e32277-6530-49aa-9df6-22211f2651ff', name: Restriction.Admin };
export const CAPABILITY_USER: Capability = { id: '795004d6-8dd4-4c97-be85-2e2420e522f1', name: Restriction.User };
export const ROLE_ADMIN: RolePortal = { id: '6b632cf2-9105-46ec-a463-ad59ab58c770' as RolePortalId, name: 'ADMIN' };
export const ROLE_USER: RolePortal = { id: '40cfe630-c272-42f9-8fcf-f219e2f4277b' as RolePortalId, name: 'USER' };
