import { v4 as uuidv4 } from 'uuid';
import { db } from '../../knexfile';
import {
  DocumentMetadataKeyCode,
  IntegrationType,
  OrganizationCapability,
  ServiceDefinition,
  ServiceInstance,
} from '../__generated__/resolvers-types';
import portalConfig from '../config';
import { withTransaction } from '../context/database.context';
import { requestContext } from '../context/request.context';
import Document from '../model/kanel/public/Document';
import Organization, {
  OrganizationId,
} from '../model/kanel/public/Organization';
import RolePortal from '../model/kanel/public/RolePortal';
import RolePortalCapabilityPortal from '../model/kanel/public/RolePortalCapabilityPortal';
import ServiceCapability from '../model/kanel/public/ServiceCapability';
import ServiceLink from '../model/kanel/public/ServiceLink';
import { UserId, UserInitializer } from '../model/kanel/public/User';
import UserOrganization, {
  UserOrganizationId,
} from '../model/kanel/public/UserOrganization';
import UserOrganizationCapability from '../model/kanel/public/UserOrganizationCapability';
import { OrganizationDomain } from '../modules/organization-management/organization/organization.domain';
import { UserDomain } from '../modules/organization-management/user/user-domain/user.domain';
import { IngestManifestApp } from '../modules/shareable-resource/opencti/integration/ingest-manifest/ingest-manifest.app';
import {
  ADMIN_UUID,
  PLATFORM_DOMAIN,
  PLATFORM_NAME,
  PLATFORM_ORGANIZATION_UUID,
  ROLE_ADMIN,
  ROLE_ADMIN_ORGA,
  ROLE_USER,
} from '../portal.const';
import { logApp } from '../utils/app-logger.util';
import { DevUser } from '../utils/config-validation.util';
import { UnknownErrorCode } from '../utils/error/error.code';
import { hashPassword } from '../utils/hash-password.util';

// Role mapping for dev user initialization
const ROLE_MAPPING: { [key: string]: string } = {
  ADMIN: ROLE_ADMIN.id,
  USER: ROLE_USER.id,
  ADMIN_ORGA: ROLE_ADMIN_ORGA.id,
};

export const ensureServiceDefinitionExists = async (service) => {
  const serviceDefinitions = await db('ServiceDefinition');
  if (
    !serviceDefinitions.find(
      (serviceDefinition) =>
        serviceDefinition.id === service.serviceDefinition.id
    )
  ) {
    await db<ServiceDefinition>('ServiceDefinition').insert(
      service.serviceDefinition
    );
  } else {
    await db<ServiceDefinition>('ServiceDefinition')
      .where({ id: service.serviceDefinition.id })
      .update(service.serviceDefinition)
      .returning('*');
  }
};
export const ensureServiceExists = async (service) => {
  const serviceInstances = await db('ServiceInstance');
  const links = await db('Service_Link');
  if (
    !serviceInstances.find(
      (serviceInstance) => serviceInstance.id === service.service.id
    )
  ) {
    await db<ServiceInstance>('ServiceInstance').insert(service.service);
  } else {
    await db<ServiceInstance>('ServiceInstance')
      .where({ id: service.service.id })
      .update(service.service)
      .returning('*');
  }
  if (!links.find((link) => link.id === service.link.id)) {
    await db<ServiceLink>('Service_Link').insert(service.link);
  } else {
    await db<ServiceLink>('Service_Link')
      .where({ id: service.link.id })
      .update(service.link)
      .returning('*');
  }
};

export const ensureServiceCapabilityExists = async (serviceCapability) => {
  const serviceCapas = await db('Service_Capability');
  if (
    !serviceCapas.find((serviceCapa) => serviceCapa.id === serviceCapability.id)
  ) {
    await db<ServiceCapability>('Service_Capability').insert(serviceCapability);
  } else {
    await db<ServiceCapability>('Service_Capability')
      .where({ id: serviceCapability.id })
      .update(serviceCapability)
      .returning('*');
  }
};
export const ensureCapabilityExists = async (capability) => {
  const capabilityPortal = await db('CapabilityPortal');
  if (!capabilityPortal.find((c) => c.id === capability.id)) {
    await db<RolePortalCapabilityPortal>('CapabilityPortal').insert(capability);
  }
};

export const ensureUserRoleExist = async (user_id, role_portal_id) => {
  const userRole = await db('User_RolePortal')
    .where({ user_id, role_portal_id })
    .first();
  if (!userRole) {
    await db('User_RolePortal').insert({
      user_id,
      role_portal_id,
    });
  }
};

export const addRoleToUser = async (user_id, role) => {
  const rolePortal = await db('RolePortal').where({ name: role }).first();
  if (!rolePortal) {
    logApp.warn(`Role portal '${role}' not found for user`);
    return;
  }
  await ensureUserRoleExist(user_id, rolePortal.id);
};

export const ensureRoleExists = async (role) => {
  const rolePortal = await db('RolePortal');
  if (!rolePortal.find((r) => r.id === role.id)) {
    await db<RolePortal>('RolePortal').insert(role);
  }
};

export const ensureRoleHasCapability = async (role, capability) => {
  const roleCapability = await db<RolePortalCapabilityPortal>(
    'RolePortal_CapabilityPortal'
  )
    .where({ capability_portal_id: capability.id, role_portal_id: role.id })
    .first();

  if (!roleCapability) {
    await db<RolePortalCapabilityPortal>('RolePortal_CapabilityPortal').insert({
      capability_portal_id: capability.id,
      role_portal_id: role.id,
    });
  }
};

export const insertPlatformOrganization = async () => {
  const adminOrganization = await OrganizationDomain.loadOrganizationBy({
    id: PLATFORM_ORGANIZATION_UUID,
  });

  if (!adminOrganization) {
    await OrganizationDomain.insertNewOrganization({
      id: PLATFORM_ORGANIZATION_UUID as OrganizationId,
      name: PLATFORM_NAME,
      domains: PLATFORM_DOMAIN,
    });
  }
};

export const insertUserAdminOrganization = async (user_id, email) => {
  const adminOrganization = await OrganizationDomain.loadOrganizationBy({
    id: user_id as unknown as OrganizationId,
  });

  if (!adminOrganization) {
    await OrganizationDomain.insertNewOrganization({
      id: user_id as unknown as OrganizationId,
      name: email,
      personal_space: true,
    });
  }
};

export const insertAdminUser = async (user_id, email, data) => {
  const userData = {
    id: user_id,
    email,
    selected_organization_id: PLATFORM_ORGANIZATION_UUID,
    ...data,
  };
  await db<UserInitializer>('User').insert(userData);
};

export const updateUserPassword = async (user_id, data) => {
  await db<UserInitializer>('User')
    .where({ id: user_id as UserId })
    .update(data)
    .returning('*');
};

export const ensureUserOrganizationExist = async (
  user_id: UserId,
  organization_id: OrganizationId
) => {
  const userOrganization = await db<UserOrganization>('User_Organization')
    .where({ user_id, organization_id })
    .first();

  if (!userOrganization) {
    await db('User_Organization').insert({
      user_id,
      organization_id,
    });
  }
};

export const ensurePersonalSpaceExist = async (
  user_id: UserId,
  mail: string
) => {
  const orgId = user_id as unknown as OrganizationId;

  await ensureOrganizationExists(orgId, mail);
  const userOrg = await ensureUserOrganizationExists(user_id, orgId);
  await ensureCapabilitiesExist(userOrg.id, [
    OrganizationCapability.AdministrateOrganization,
  ]);
};

const ensureOrganizationExists = async (
  orgId: OrganizationId,
  mail: string
) => {
  const personalSpace = await OrganizationDomain.loadOrganizationBy({
    id: orgId,
  });

  if (!personalSpace) {
    await OrganizationDomain.insertNewOrganization({
      id: orgId,
      name: mail,
      personal_space: true,
    });
  }
};

const ensureUserOrganizationExists = async (
  user_id: UserId,
  orgId: OrganizationId
) => {
  const userOrg = await db<UserOrganization>('User_Organization')
    .where({ user_id, organization_id: orgId })
    .first();

  if (!userOrg) {
    const query = db<UserOrganization>('User_Organization')
      .insert({ user_id, organization_id: orgId })
      .returning('id');

    const [insertedRecord] = await query;
    return { id: insertedRecord.id };
  }
  return userOrg;
};

const ensureCapabilitiesExist = async (
  userOrgId: UserOrganizationId,
  capabilities: string[]
) => {
  for (const capability of capabilities) {
    const existingCapability = await db<UserOrganizationCapability>(
      'UserOrganization_Capability'
    )
      .where({ user_organization_id: userOrgId, name: capability })
      .first();

    if (!existingCapability) {
      await db<UserOrganizationCapability>(
        'UserOrganization_Capability'
      ).insert({ user_organization_id: userOrgId, name: capability });
    }
  }
};

/**
 * Creates or updates a development organization from config
 */
export const ensureDevOrganizationExists = async (orgConfig: {
  name: string;
  domains?: string[];
}): Promise<Organization> => {
  // Check if organization already exists by name
  const existingOrg = await OrganizationDomain.loadOrganizationBy({
    name: orgConfig.name,
    personal_space: false,
  });

  if (existingOrg) {
    // Update domains if provided
    if (orgConfig.domains && orgConfig.domains.length > 0) {
      const updatedOrg = await OrganizationDomain.updateOrganizationBy(
        { id: existingOrg.id },
        { domains: orgConfig.domains }
      );
      if (!updatedOrg) {
        throw new Error(UnknownErrorCode.EditOrganizationError);
      }
      return updatedOrg;
    }
    return existingOrg;
  }

  // Create new organization
  const newOrg = await OrganizationDomain.insertNewOrganization({
    id: uuidv4() as OrganizationId,
    name: orgConfig.name,
    domains: orgConfig.domains || [],
    personal_space: false,
  });

  return newOrg;
};

/**
 * Creates or updates a development user
 */
export const ensureDevUserExists = async (
  userConfig: DevUser
): Promise<void> => {
  try {
    await withTransaction(async () => {
      // Check if user already exists
      const existingUser = await db<UserInitializer>('User')
        .where({ email: userConfig.email })
        .first();

      let userId: UserId;
      let isNewUser = false;

      if (existingUser) {
        userId = existingUser.id;
        // Update password
        const { salt, hash } = hashPassword(userConfig.password);
        await db<UserInitializer>('User')
          .where({ id: userId })
          .update({ salt, password: hash });

        logApp.info(`Updated dev user: ${userConfig.email}`);
      } else {
        // Create new user
        userId = uuidv4() as UserId;
        isNewUser = true;

        const { salt, hash } = hashPassword(userConfig.password);
        const userData: Partial<UserInitializer> = {
          id: userId,
          email: userConfig.email,
          salt,
          password: hash,
          selected_organization_id: PLATFORM_ORGANIZATION_UUID,
        };

        await db<UserInitializer>('User').insert(userData);

        logApp.info(`Created dev user: ${userConfig.email}`);
      }

      // Handle organization membership
      let orgId: OrganizationId;

      if (userConfig.organization) {
        // Create/update organization and assign user
        const org = await ensureDevOrganizationExists({
          name: userConfig.organization.name,
          domains: userConfig.organization.domains,
        });
        orgId = org.id;

        await ensureUserOrganizationExist(userId, orgId);

        // Set as default organization for new users
        if (isNewUser) {
          await db<UserInitializer>('User')
            .where({ id: userId })
            .update({ selected_organization_id: orgId });
        }
      }

      // Always ensure platform organization membership
      await ensureUserOrganizationExist(userId, PLATFORM_ORGANIZATION_UUID);

      // Handle roles
      const roles = userConfig.roles || ['USER'];
      for (const roleName of roles) {
        const roleId = ROLE_MAPPING[roleName];
        if (!roleId) {
          logApp.warn(
            `Role '${roleName}' is not recognized and will be skipped for user ${userConfig.email}`
          );
          continue;
        }

        await ensureUserRoleExist(userId, roleId);
      }

      // Always create personal space
      await ensurePersonalSpaceExist(userId, userConfig.email);
    });
  } catch (error) {
    logApp.error(
      `Failed to initialize dev user ${userConfig.email}: ${error.message}`
    );
    throw error;
  }
};

/**
 * Initialize all development users from configuration
 */
export const initializeDevUsers = async (): Promise<void> => {
  if (!portalConfig.dev_users || portalConfig.dev_users.length === 0) {
    return; // No dev users to initialize
  }

  logApp.info(
    `Initializing ${portalConfig.dev_users.length} development users`
  );

  for (const userConfig of portalConfig.dev_users) {
    try {
      await ensureDevUserExists(userConfig);
    } catch (error) {
      logApp.warn(
        `Failed to initialize dev user ${userConfig.email}: ${error.message}`
      );
      // Continue with other users
    }
  }

  logApp.info('Development users initialization completed');
};

/**
 * Ingest fixed connectors manifest for development environment.
 */
export const seedDevelopmentConnectors = async () => {
  const areConnectorsSeeded = await db<Document>('Document_Metadata')
    .where('key', '=', DocumentMetadataKeyCode.IntegrationType)
    .andWhere('value', '=', IntegrationType.Connector)
    .first();

  if (areConnectorsSeeded) {
    logApp.info('[SEEDING] OpenCTI connectors already seeded');

    return;
  }

  logApp.info('[SEEDING] Ingesting OpenCTI connectors manifest...');
  const user = await UserDomain.loadUserBy({ 'User.id': ADMIN_UUID });
  requestContext.run({ user }, async () => {
    await IngestManifestApp.updateOpenCTIManifest('6.8.3');
  });
  logApp.info('[SEEDING] OpenCTI connectors seeding completed');
};
