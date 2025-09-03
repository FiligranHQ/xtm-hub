import { v4 as uuidv4 } from 'uuid';
import { dbTx, dbUnsecure } from '../../knexfile';
import {
  OrganizationCapability,
  ServiceDefinition,
  ServiceInstance,
} from '../__generated__/resolvers-types';
import portalConfig from '../config';
import Organization, {
  OrganizationId,
} from '../model/kanel/public/Organization';
import RolePortal from '../model/kanel/public/RolePortal';
import RolePortalCapabilityPortal from '../model/kanel/public/RolePortalCapabilityPortal';
import ServiceCapability from '../model/kanel/public/ServiceCapability';
import ServiceLink from '../model/kanel/public/ServiceLink';
import ServicePrice from '../model/kanel/public/ServicePrice';
import { UserId, UserInitializer } from '../model/kanel/public/User';
import UserOrganization, {
  UserOrganizationId,
} from '../model/kanel/public/UserOrganization';
import UserOrganizationCapability from '../model/kanel/public/UserOrganizationCapability';
import {
  ADMIN_UUID,
  PLATFORM_ORGANIZATION_UUID,
  ROLE_ADMIN,
  ROLE_USER,
} from '../portal.const';
import { logApp } from '../utils/app-logger.util';
import { DevUser } from '../utils/config-validation.util';
import { hashPassword } from '../utils/hash-password.util';

export const ensureServiceDefinitionExists = async (service) => {
  const serviceDefinitions = await dbUnsecure('ServiceDefinition');
  if (
    !serviceDefinitions.find(
      (serviceDefinition) =>
        serviceDefinition.id === service.serviceDefinition.id
    )
  ) {
    await dbUnsecure<ServiceDefinition>('ServiceDefinition').insert(
      service.serviceDefinition
    );
  } else {
    await dbUnsecure<ServiceDefinition>('ServiceDefinition')
      .where({ id: service.serviceDefinition.id })
      .update(service.serviceDefinition)
      .returning('*');
  }

  const prices = await dbUnsecure('Service_Price');
  if (!prices.find((price) => price.id === service.price.id)) {
    await dbUnsecure<ServicePrice>('Service_Price').insert(service.price);
  } else {
    await dbUnsecure<ServicePrice>('Service_Price')
      .where({ id: service.price.id })
      .update(service.price)
      .returning('*');
  }
};
export const ensureServiceExists = async (service) => {
  const serviceInstances = await dbUnsecure('ServiceInstance');
  const links = await dbUnsecure('Service_Link');
  if (
    !serviceInstances.find(
      (serviceInstance) => serviceInstance.id === service.service.id
    )
  ) {
    await dbUnsecure<ServiceInstance>('ServiceInstance').insert(
      service.service
    );
  } else {
    await dbUnsecure<ServiceInstance>('ServiceInstance')
      .where({ id: service.service.id })
      .update(service.service)
      .returning('*');
  }
  if (!links.find((link) => link.id === service.link.id)) {
    await dbUnsecure<ServiceLink>('Service_Link').insert(service.link);
  } else {
    await dbUnsecure<ServiceLink>('Service_Link')
      .where({ id: service.link.id })
      .update(service.link)
      .returning('*');
  }
};

export const ensureServiceCapabilityExists = async (serviceCapability) => {
  const serviceCapas = await dbUnsecure('Service_Capability');
  if (
    !serviceCapas.find((serviceCapa) => serviceCapa.id === serviceCapability.id)
  ) {
    await dbUnsecure<ServiceCapability>('Service_Capability').insert(
      serviceCapability
    );
  } else {
    await dbUnsecure<ServiceCapability>('Service_Capability')
      .where({ id: serviceCapability.id })
      .update(serviceCapability)
      .returning('*');
  }
};
export const ensureCapabilityExists = async (capability, trx) => {
  const capabilityPortal = await dbUnsecure('CapabilityPortal');
  if (!capabilityPortal.find((c) => c.id === capability.id)) {
    await dbUnsecure<RolePortalCapabilityPortal>('CapabilityPortal')
      .insert(capability)
      .transacting(trx);
  }
};

export const ensureUserRoleExist = async (user_id, role_portal_id, trx?) => {
  const userRole = await dbUnsecure('User_RolePortal')
    .where({ user_id, role_portal_id })
    .first();
  if (!userRole) {
    const query = dbUnsecure('User_RolePortal').insert({
      user_id,
      role_portal_id,
    });
    if (trx) {
      await query.transacting(trx);
    } else {
      await query;
    }
  }
};

export const ensureRoleExists = async (role, trx) => {
  const rolePortal = await dbUnsecure('RolePortal');
  if (!rolePortal.find((r) => r.id === role.id)) {
    await dbUnsecure<RolePortal>('RolePortal').insert(role).transacting(trx);
  }
};

export const ensureRoleHasCapability = async (role, capability, trx) => {
  const roleCapability = await dbUnsecure<RolePortalCapabilityPortal>(
    'RolePortal_CapabilityPortal'
  )
    .where({ capability_portal_id: capability.id, role_portal_id: role.id })
    .first();

  if (!roleCapability) {
    await dbUnsecure<RolePortalCapabilityPortal>('RolePortal_CapabilityPortal')
      .insert({
        capability_portal_id: capability.id,
        role_portal_id: role.id,
      })
      .transacting(trx);
  }
};

export const insertPlatformOrganization = async (trx) => {
  const adminOrganization = await dbUnsecure<Organization>('Organization')
    .where({ id: PLATFORM_ORGANIZATION_UUID })
    .first();
  if (!adminOrganization) {
    await dbUnsecure<Organization>('Organization')
      .insert({
        id: PLATFORM_ORGANIZATION_UUID as OrganizationId,
        name: 'Filigran',
        domains: ['filigran.io'],
      })
      .transacting(trx);
  }
};

export const insertUserAdminOrganization = async (trx) => {
  const adminOrganization = await dbUnsecure<Organization>('Organization')
    .where({ id: ADMIN_UUID as unknown as OrganizationId })
    .first();
  if (!adminOrganization) {
    await dbUnsecure<Organization>('Organization')
      .insert({
        id: ADMIN_UUID as unknown as OrganizationId,
        name: portalConfig.admin.email,
        personal_space: true,
      })
      .transacting(trx);
  }
};

export const insertAdminUser = async (trx, email, data) => {
  const userData = {
    id: ADMIN_UUID,
    email,
    selected_organization_id: PLATFORM_ORGANIZATION_UUID,
    ...data,
  };
  await dbUnsecure<UserInitializer>('User').insert(userData).transacting(trx);
};

export const updateUserPassword = async (data) => {
  await dbUnsecure<UserInitializer>('User')
    .where({ id: ADMIN_UUID as UserId })
    .update(data)
    .returning('*');
};

export const ensureUserOrganizationExist = async (
  user_id: UserId,
  organization_id: OrganizationId,
  trx?
) => {
  const userOrganization = await dbUnsecure<UserOrganization>(
    'User_Organization'
  )
    .where({ user_id, organization_id })
    .first();

  if (!userOrganization) {
    const query = dbUnsecure('User_Organization').insert({
      user_id,
      organization_id,
    });
    if (trx) {
      await query.transacting(trx);
    } else {
      await query;
    }
  }
};

export const ensurePersonalSpaceExist = async (
  user_id: UserId,
  mail: string,
  trx?
) => {
  const orgId = user_id as unknown as OrganizationId;

  await ensureOrganizationExists(orgId, mail, trx);
  const userOrg = await ensureUserOrganizationExists(user_id, orgId, trx);
  await ensureCapabilitiesExist(
    userOrg.id,
    [OrganizationCapability.AdministrateOrganization],
    trx
  );
};

const ensureOrganizationExists = async (
  orgId: OrganizationId,
  mail: string,
  trx?
) => {
  const personalSpace = await dbUnsecure<Organization>('Organization')
    .where({ id: orgId })
    .first();

  if (!personalSpace) {
    const query = dbUnsecure('Organization').insert({
      id: orgId,
      name: mail,
      personal_space: true,
    });
    if (trx) {
      await query.transacting(trx);
    } else {
      await query;
    }
  }
};

const ensureUserOrganizationExists = async (
  user_id: UserId,
  orgId: OrganizationId,
  trx?
) => {
  const userOrg = await dbUnsecure<UserOrganization>('User_Organization')
    .where({ user_id, organization_id: orgId })
    .first();

  if (!userOrg) {
    const query = dbUnsecure<UserOrganization>('User_Organization')
      .insert({ user_id, organization_id: orgId })
      .returning('id');

    const [insertedId] = trx ? await query.transacting(trx) : await query;
    return { id: insertedId };
  }
  return userOrg;
};

const ensureCapabilitiesExist = async (
  userOrgId: UserOrganizationId,
  capabilities: string[],
  trx?
) => {
  for (const capability of capabilities) {
    const existingCapability = await dbUnsecure<UserOrganizationCapability>(
      'UserOrganization_Capability'
    )
      .where({ user_organization_id: userOrgId, name: capability })
      .first();

    if (!existingCapability) {
      const query = dbUnsecure<UserOrganizationCapability>(
        'UserOrganization_Capability'
      ).insert({ user_organization_id: userOrgId, name: capability });

      if (trx) {
        await query.transacting(trx);
      } else {
        await query;
      }
    }
  }
};

/**
 * Creates or updates a development organization from config
 */
export const ensureDevOrganizationExists = async (
  orgConfig: { name: string; domains?: string[] },
  trx?
): Promise<Organization> => {
  // Check if organization already exists by name
  const existingOrg = await dbUnsecure<Organization>('Organization')
    .where({ name: orgConfig.name, personal_space: false })
    .first();

  if (existingOrg) {
    // Update domains if provided
    if (orgConfig.domains && orgConfig.domains.length > 0) {
      const query = dbUnsecure<Organization>('Organization')
        .where({ id: existingOrg.id })
        .update({ domains: orgConfig.domains })
        .returning('*');

      const [updatedOrg] = trx ? await query.transacting(trx) : await query;
      return updatedOrg;
    }
    return existingOrg;
  }

  // Create new organization
  const orgData: Partial<Organization> = {
    id: uuidv4() as OrganizationId,
    name: orgConfig.name,
    domains: orgConfig.domains || [],
    personal_space: false,
  };

  const query = dbUnsecure<Organization>('Organization')
    .insert(orgData)
    .returning('*');

  const [newOrg] = trx ? await query.transacting(trx) : await query;
  return newOrg;
};

/**
 * Creates or updates a development user
 */
export const ensureDevUserExists = async (
  userConfig: DevUser
): Promise<void> => {
  const trx = await dbTx();

  try {
    // Check if user already exists
    const existingUser = await dbUnsecure<UserInitializer>('User')
      .where({ email: userConfig.email })
      .first();

    let userId: UserId;
    let isNewUser = false;

    if (existingUser) {
      userId = existingUser.id;
      // Update password
      const { salt, hash } = hashPassword(userConfig.password);
      await dbUnsecure<UserInitializer>('User')
        .where({ id: userId })
        .update({ salt, password: hash })
        .transacting(trx);

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

      await dbUnsecure<UserInitializer>('User')
        .insert(userData)
        .transacting(trx);

      logApp.info(`Created dev user: ${userConfig.email}`);
    }

    // Handle organization membership
    let orgId: OrganizationId;

    if (userConfig.organization) {
      // Create/update organization and assign user
      const org = await ensureDevOrganizationExists(
        {
          name: userConfig.organization.name,
          domains: userConfig.organization.domains,
        },
        trx
      );
      orgId = org.id;

      await ensureUserOrganizationExist(userId, orgId, trx);

      // Set as default organization for new users
      if (isNewUser) {
        await dbUnsecure<UserInitializer>('User')
          .where({ id: userId })
          .update({ selected_organization_id: orgId })
          .transacting(trx);
      }
    }

    // Always ensure platform organization membership
    await ensureUserOrganizationExist(userId, PLATFORM_ORGANIZATION_UUID, trx);

    // Handle roles
    const roleMapping: { [key: string]: string } = {
      ADMIN: ROLE_ADMIN.id,
      USER: ROLE_USER.id,
      ADMIN_ORGA: '40cfe630-c272-42f9-8fcf-f219e2f4278c', // ROLE_ADMIN_ORGA.id
    };

    const roles = userConfig.roles || ['USER'];
    for (const roleName of roles) {
      const roleId = roleMapping[roleName];
      if (!roleId) {
        logApp.warn(
          `Role '${roleName}' is not recognized and will be skipped for user ${userConfig.email}`
        );
        continue;
      }

      await ensureUserRoleExist(userId, roleId, trx);
    }

    // Always create personal space
    await ensurePersonalSpaceExist(userId, userConfig.email, trx);

    await trx.commit();
  } catch (error) {
    await trx.rollback();
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
