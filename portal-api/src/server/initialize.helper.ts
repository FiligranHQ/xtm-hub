import { dbUnsecure } from '../../knexfile';
import RolePortal from '../model/kanel/public/RolePortal';
import RolePortalCapabilityPortal from '../model/kanel/public/RolePortalCapabilityPortal';
import { ADMIN_UUID, PLATFORM_ORGANIZATION_UUID } from '../portal.const';
import { UserWithAuthentication } from '../modules/users/users';
import Service from '../model/kanel/public/Service';
import ServicePrice from '../model/kanel/public/ServicePrice';
import ServiceLink from '../model/kanel/public/ServiceLink';
import Organization, {
  OrganizationId,
} from '../model/kanel/public/Organization';

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
    .where({ user_id })
    .where({ role_portal_id })
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
    .where({ capability_portal_id: capability.id })
    .where({ role_portal_id: role.id })
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
  await dbUnsecure<Organization>('Organization')
    .insert({
      id: PLATFORM_ORGANIZATION_UUID as OrganizationId,
      name: 'Internal',
    })
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
