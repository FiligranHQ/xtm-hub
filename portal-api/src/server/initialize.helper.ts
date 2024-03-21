import { dbUnsecure } from '../../knexfile';
import { Capability, Organization } from '../__generated__/resolvers-types';
import { UserWithAuthentication } from '../users/users';
import { ADMIN_UUID, PLATFORM_ORGANIZATION_UUID } from './initialize';
import RolePortal from '../model/kanel/public/RolePortal';
import RolePortalCapabilityPortal from '../model/kanel/public/RolePortalCapabilityPortal';

export const ensureCapabilityExists = async (capability, trx) => {
  const capabilityPortal = await dbUnsecure('CapabilityPortal');
  if (!capabilityPortal.find((c) => c.id === capability.id)) {
    await dbUnsecure<Capability>('CapabilityPortal').insert(capability).transacting(trx);
  }
};

export const ensureRoleExists = async (role, trx) => {
  const rolePortal = await dbUnsecure('RolePortal');
  if (!rolePortal.find((r) => r.id === role.id)) {
    await dbUnsecure<RolePortal>('RolePortal').insert(role).transacting(trx);
  }
};

export const ensureRoleHasCapability = async (role, capability, trx) => {
  const roleCapability = await dbUnsecure<RolePortalCapabilityPortal>('RolePortal_CapabilityPortal')
    .where({ capability_portal_id: capability.id })
    .where({ role_portal_id: role.id })
    .first();

  if (!roleCapability) {
    await dbUnsecure<RolePortalCapabilityPortal>('RolePortal_CapabilityPortal').insert({
      capability_portal_id: capability.id,
      role_portal_id: role.id,
    }).transacting(trx);
  }
};

export const insertPlatformOrganization = async (trx) => {
  await dbUnsecure<Organization>('Organization')
    .insert({ id: PLATFORM_ORGANIZATION_UUID, name: 'Internal' })
    .transacting(trx);
};

export const insertAdminUser = async (trx, email, data) => {
  const userData = {
    id: ADMIN_UUID,
    email,
    organization_id: PLATFORM_ORGANIZATION_UUID,
    ...data,
  };
  await dbUnsecure<UserWithAuthentication>('User')
    .insert(userData)
    .transacting(trx);
};

export const updateUserPassword = async (data) => {
  await dbUnsecure<UserWithAuthentication>('User')
    .where({ id: ADMIN_UUID })
    .update(data)
    .returning('*');
};
