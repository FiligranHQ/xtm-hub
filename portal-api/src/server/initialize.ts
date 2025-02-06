import { dbTx, dbUnsecure } from '../../knexfile';
import { User } from '../__generated__/resolvers-types';
import portalConfig from '../config';
import { OrganizationId } from '../model/kanel/public/Organization';
import { isStorageAlive } from '../modules/services/document/document-storage';
import {
  ADMIN_UUID,
  CAPABILITY_BCK_MANAGE_SERVICES,
  CAPABILITY_BYPASS,
  CAPABILITY_FRT_ACCESS_BILLING,
  CAPABILITY_FRT_ACCESS_SERVICES,
  CAPABILITY_FRT_MANAGE_SETTINGS,
  CAPABILITY_FRT_MANAGE_USER,
  CAPABILITY_FRT_SERVICE_SELF_SUBSCRIBER,
  CAPABILITY_FRT_SERVICE_SUBSCRIBER,
  PLATFORM_ORGANIZATION_UUID,
  ROLE_ADMIN,
  ROLE_ADMIN_ORGA,
  ROLE_USER,
} from '../portal.const';
import { hashPassword } from '../utils/hash-password.util';
import {
  ensureCapabilityExists,
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
    await ensureCapabilityExists(CAPABILITY_BCK_MANAGE_SERVICES, trx);
    await ensureCapabilityExists(CAPABILITY_FRT_SERVICE_SUBSCRIBER, trx);
    await ensureCapabilityExists(CAPABILITY_FRT_MANAGE_SETTINGS, trx);
    await ensureCapabilityExists(CAPABILITY_FRT_ACCESS_BILLING, trx);
    await ensureCapabilityExists(CAPABILITY_FRT_MANAGE_USER, trx);
    await ensureCapabilityExists(CAPABILITY_FRT_ACCESS_SERVICES, trx);
    await ensureCapabilityExists(CAPABILITY_FRT_SERVICE_SELF_SUBSCRIBER, trx);

    // Ensure ROLE_ADMIN and ROLE_USER exist in RolePortal
    await ensureRoleExists(ROLE_ADMIN, trx);
    await ensureRoleExists(ROLE_USER, trx);
    await ensureRoleExists(ROLE_ADMIN_ORGA, trx);

    // Ensure ROLE_ADMIN has CAPABILITY_BYPASS
    await ensureRoleHasCapability(ROLE_ADMIN, CAPABILITY_BYPASS, trx);
    await ensureRoleHasCapability(
      ROLE_ADMIN_ORGA,
      CAPABILITY_BCK_MANAGE_SERVICES,
      trx
    );
    await ensureRoleHasCapability(
      ROLE_ADMIN_ORGA,
      CAPABILITY_FRT_SERVICE_SUBSCRIBER,
      trx
    );
    await ensureRoleHasCapability(
      ROLE_ADMIN_ORGA,
      CAPABILITY_FRT_MANAGE_SETTINGS,
      trx
    );
    await ensureRoleHasCapability(
      ROLE_ADMIN_ORGA,
      CAPABILITY_FRT_ACCESS_BILLING,
      trx
    );
    await ensureRoleHasCapability(
      ROLE_ADMIN_ORGA,
      CAPABILITY_FRT_MANAGE_USER,
      trx
    );
    await ensureRoleHasCapability(
      ROLE_ADMIN_ORGA,
      CAPABILITY_FRT_ACCESS_SERVICES,
      trx
    );
    await ensureRoleHasCapability(
      ROLE_ADMIN_ORGA,
      CAPABILITY_FRT_SERVICE_SELF_SUBSCRIBER,
      trx
    );
    await ensureRoleHasCapability(
      ROLE_USER,
      CAPABILITY_FRT_ACCESS_SERVICES,
      trx
    );
    await ensureRoleHasCapability(
      ROLE_USER,
      CAPABILITY_FRT_SERVICE_SELF_SUBSCRIBER,
      trx
    );

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
