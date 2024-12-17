import { dbUnsecure } from '../../knexfile';
import portalConfig from '../config';
import Organization, {
  OrganizationId,
} from '../model/kanel/public/Organization';
import RolePortal from '../model/kanel/public/RolePortal';
import RolePortalCapabilityPortal from '../model/kanel/public/RolePortalCapabilityPortal';
import Service from '../model/kanel/public/Service';
import ServiceLink from '../model/kanel/public/ServiceLink';
import ServicePrice from '../model/kanel/public/ServicePrice';
import { UserId, UserInitializer } from '../model/kanel/public/User';
import UserOrganization from '../model/kanel/public/UserOrganization';
import { ADMIN_UUID, PLATFORM_ORGANIZATION_UUID } from '../portal.const';

export const ensureServiceExists = async (service) => {
  const services = await dbUnsecure('Service');
  const links = await dbUnsecure('Service_Link');
  const prices = await dbUnsecure('Service_Price');
  if (!services.find((s) => s.id === service.service.id)) {
    await dbUnsecure<Service>('Service').insert(service.service);
  } else {
    await dbUnsecure<Service>('Service')
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
  if (!prices.find((price) => price.id === service.price.id)) {
    await dbUnsecure<ServicePrice>('Service_Price').insert(service.price);
  } else {
    await dbUnsecure<ServicePrice>('Service_Price')
      .where({ id: service.price.id })
      .update(service.price)
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
