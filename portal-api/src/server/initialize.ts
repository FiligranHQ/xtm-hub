import portalConfig from '../config.js';
import { CAPABILITY_ADMIN, CAPABILITY_BYPASS, dbTx, dbUnsecure, ROLE_ADMIN, ROLE_USER } from '../../knexfile.js';
import { Capability, Organization, User } from '../__generated__/resolvers-types.js';
import crypto from 'node:crypto';
import { UserWithAuthentication } from '../users/users.js';
import { Role, RoleCapability } from '../model/role.js';

export const ADMIN_UUID = 'ba091095-418f-4b4f-b150-6c9295e232c3';
export const PLATFORM_ORGANIZATION_UUID = 'ba091095-418f-4b4f-b150-6c9295e232c4';

export const hashPassword = (password: string) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, `sha512`).toString(`hex`);
  return { salt, hash };
};

const initAdminUser = async () => {
  const { email, password } = portalConfig.admin;
  const adminUser = await dbUnsecure<User>('User').where({ id: ADMIN_UUID }).first();
  const { salt, hash } = hashPassword(password);
  const data = { salt, password: hash };
  // User already exists
  if (adminUser) {
    // Update the password and salt
    await dbUnsecure<UserWithAuthentication>('User').where({ id: ADMIN_UUID }).update(data).returning('*');
  } else { // User not yet exist, need a complete init
    const trx = await dbTx();
    // Check the platform organization
    const adminOrganization = await dbUnsecure<User>('Organization').where({ id: PLATFORM_ORGANIZATION_UUID }).first();
    if (!adminOrganization) {
      await dbUnsecure<Organization>('Organization')
        .insert({ id: PLATFORM_ORGANIZATION_UUID, name: 'Internal' }).transacting(trx)
        .returning('*');
    }
    const data = { id: ADMIN_UUID, email, salt, password: hash, organization_id: PLATFORM_ORGANIZATION_UUID };
    await dbUnsecure<UserWithAuthentication>('User').insert(data).transacting(trx).returning('*');
    trx.commit();
  }
};

const initCapabilityAndRole = async () => {
  const trx = await dbTx();
  try {

    // Ensure CAPABILITY_BYPASS and CAPABILITY_ADMIN exist in CapabilityPortal
    await ensureCapabilityExists(CAPABILITY_BYPASS, trx);
    await ensureCapabilityExists(CAPABILITY_ADMIN, trx);

    // Ensure ROLE_ADMIN and ROLE_USER exist in RolePortal
    await ensureRoleExists(ROLE_ADMIN, trx);
    await ensureRoleExists(ROLE_USER, trx);

    // Ensure ROLE_ADMIN has CAPABILITY_BYPASS
    await ensureRoleHasCapability(ROLE_ADMIN, CAPABILITY_BYPASS, trx);

    await trx.commit();
  } catch (error) {
    await trx.rollback();
    throw error;
  }
};

const ensureCapabilityExists = async (capability, trx) => {
  const capabilityPortal = await dbUnsecure('CapabilityPortal');
  if (!capabilityPortal.find((c) => c.id === capability.id)) {
    await dbUnsecure<Capability>('CapabilityPortal').insert(capability).transacting(trx);
  }
};

const ensureRoleExists = async (role, trx) => {
  const rolePortal = await dbUnsecure('RolePortal');
  if (!rolePortal.find((r) => r.id === role.id)) {
    await dbUnsecure<Role>('RolePortal').insert(role).transacting(trx);
  }
};

const ensureRoleHasCapability = async (role, capability, trx) => {
  const roleCapability = await dbUnsecure<RoleCapability>('RolePortal_CapabilityPortal')
    .where({ capability_portal_id: capability.id })
    .where({ role_portal_id: role.id })
    .first();

  if (!roleCapability) {
    await dbUnsecure<RoleCapability>('RolePortal_CapabilityPortal').insert({
      capability_portal_id: capability.id,
      role_portal_id: role.id,
    }).transacting(trx);
  }
};
const initializeBuiltInAdministrator = async () => {
  // Initialize default admin user
  await initAdminUser();
  // Initialize default Role and Capability
  await initCapabilityAndRole();
};

const platformInit = async () => {
  await initializeBuiltInAdministrator();
};

export default platformInit;
