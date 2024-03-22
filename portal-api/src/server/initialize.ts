import portalConfig from '../config';
import { CAPABILITY_ADMIN, CAPABILITY_BYPASS, dbTx, dbUnsecure, ROLE_ADMIN, ROLE_USER } from '../../knexfile';
import { Organization, User } from '../__generated__/resolvers-types';
import {
  ensureCapabilityExists,
  ensureRoleExists,
  ensureRoleHasCapability,
  ensureUserRoleExist,
  insertAdminUser,
  insertPlatformOrganization,
  updateUserPassword,
} from './initialize.helper';
import { hashPassword } from '../utils/hash-password.util';

export const ADMIN_UUID = 'ba091095-418f-4b4f-b150-6c9295e232c3';
export const PLATFORM_ORGANIZATION_UUID = 'ba091095-418f-4b4f-b150-6c9295e232c4';

const initAdminUser = async () => {
  const { email, password } = portalConfig.admin;
  const adminUser = await dbUnsecure<User>('User').where({ id: ADMIN_UUID }).first();
  const { salt, hash } = hashPassword(password);
  const data = { salt, password: hash };
  if (adminUser) {
    // Update the password and salt
    await updateUserPassword(data);
  } else {
    // User not yet exist, need a complete init
    await completeUserInitialization(email, data);
  }
  ensureUserRoleExist(ADMIN_UUID, ROLE_ADMIN.id);
};

const completeUserInitialization = async (email, data) => {
  const trx = await dbTx();
  try {
    // Check the platform organization
    const adminOrganization = await dbUnsecure<Organization>('Organization')
      .where({ id: PLATFORM_ORGANIZATION_UUID })
      .first();

    if (!adminOrganization) {
      await insertPlatformOrganization(trx);
    }
    await insertAdminUser(trx, email, data);

    await trx.commit();
  } catch (error) {
    await trx.rollback();
    throw error;
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

const initializeBuiltInAdministrator = async () => {
  // Initialize default Role and Capability
  await initCapabilityAndRole();
  // Initialize default admin user
  await initAdminUser();
};

const platformInit = async () => {
  await initializeBuiltInAdministrator();
};

export default platformInit;
