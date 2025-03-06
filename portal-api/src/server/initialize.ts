import { dbTx, dbUnsecure } from '../../knexfile';
import { User } from '../__generated__/resolvers-types';
import portalConfig from '../config';
import { OrganizationId } from '../model/kanel/public/Organization';
import { isStorageAlive } from '../modules/services/document/document-storage';
import {
  ADMIN_UUID,
  CAPABILITY_BYPASS,
  PLATFORM_ORGANIZATION_UUID,
  ROLE_ADMIN,
} from '../portal.const';
import { hashPassword } from '../utils/hash-password.util';
import {
  ensureCapabilityExists,
  ensurePersonalSpaceExist,
  ensureRoleExists,
  ensureRoleHasCapability,
  ensureServiceDefinitionExists,
  ensureServiceExists,
  ensureUserOrganizationExist,
  ensureUserRoleExist,
  insertAdminUser,
  insertPlatformOrganization,
  insertUserAdminOrganization,
  updateUserPassword,
} from './initialize.helper';

const initAdminUser = async () => {
  const { email, password } = portalConfig.admin;
  const adminUser = await dbUnsecure<User>('User')
    .where({ id: ADMIN_UUID })
    .first();
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
  ensurePersonalSpaceExist(ADMIN_UUID, email);
};

const completeUserInitialization = async (email, data) => {
  const trx = await dbTx();
  try {
    // Check the platform organization

    await insertPlatformOrganization(trx);
    await insertUserAdminOrganization(trx);

    await insertAdminUser(trx, email, data);

    await ensureUserOrganizationExist(
      ADMIN_UUID,
      PLATFORM_ORGANIZATION_UUID,
      trx
    );
    await ensureUserOrganizationExist(
      ADMIN_UUID,
      ADMIN_UUID as unknown as OrganizationId,
      trx
    );

    await trx.commit();
  } catch (error) {
    await trx.rollback();
    throw error;
  }
};

const initCapabilityAndRole = async () => {
  const trx = await dbTx();
  try {
    await ensureCapabilityExists(CAPABILITY_BYPASS, trx);
    await ensureRoleExists(ROLE_ADMIN, trx);
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

const initializeDefaultServices = async () => {
  for (const serviceDefinition of portalConfig.service_definitions) {
    await ensureServiceDefinitionExists(serviceDefinition);
  }
  for (const service of portalConfig.services) {
    await ensureServiceExists(service);
  }
};

const platformInit = async () => {
  await initializeDefaultServices();
  await initializeBuiltInAdministrator();
};

export const minioInit = async () => {
  await isStorageAlive();
};

export default platformInit;
