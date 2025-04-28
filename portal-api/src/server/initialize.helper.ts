import { dbUnsecure } from '../../knexfile';
import {
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
import { ADMIN_UUID, PLATFORM_ORGANIZATION_UUID } from '../portal.const';

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

export const ensureUserRoleExist = async (user_id, role_portal_id) => {
  const userRole = await dbUnsecure('User_RolePortal')
    .where({ user_id, role_portal_id })
    .first();
  if (!userRole) {
    await dbUnsecure('User_RolePortal').insert({ user_id, role_portal_id });
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
  mail: string
) => {
  const orgId = user_id as unknown as OrganizationId;

  await ensureOrganizationExists(orgId, mail);
  const userOrg = await ensureUserOrganizationExists(user_id, orgId);
  await ensureCapabilitiesExist(userOrg.id, ['MANAGE_SUBSCRIPTION']);
};

const ensureOrganizationExists = async (
  orgId: OrganizationId,
  mail: string
) => {
  const personalSpace = await dbUnsecure<Organization>('Organization')
    .where({ id: orgId })
    .first();

  if (!personalSpace) {
    await dbUnsecure('Organization').insert({
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
  const userOrg = await dbUnsecure<UserOrganization>('User_Organization')
    .where({ user_id, organization_id: orgId })
    .first();

  if (!userOrg) {
    const [insertedId] = await dbUnsecure<UserOrganization>('User_Organization')
      .insert({ user_id, organization_id: orgId })
      .returning('id');
    return { id: insertedId };
  }
  return userOrg;
};

const ensureCapabilitiesExist = async (
  userOrgId: UserOrganizationId,
  capabilities: string[]
) => {
  for (const capability of capabilities) {
    const existingCapability = await dbUnsecure<UserOrganizationCapability>(
      'UserOrganization_Capability'
    )
      .where({ user_organization_id: userOrgId, name: capability })
      .first();

    if (!existingCapability) {
      await dbUnsecure<UserOrganizationCapability>(
        'UserOrganization_Capability'
      ).insert({ user_organization_id: userOrgId, name: capability });
    }
  }
};
