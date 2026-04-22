import { db, paginate } from '../../../../knexfile';
import {
  Filter,
  FilterKey,
  OrganizationConnection,
  QueryOrganizationsArgs,
} from '../../../__generated__/resolvers-types';
import Organization, {
  OrganizationId,
  OrganizationInitializer,
  OrganizationMutator,
} from '../../../model/kanel/public/Organization';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import User, { UserId } from '../../../model/kanel/public/User';

export const organizationDomain = {
  loadOrganizationByLikeName: (name: string) => {
    return db<Organization>('Organization')
      .where('name', 'ILIKE', name)
      .first('id');
  },

  loadOrganizationSubscribedToServiceInstance: async (
    serviceInstanceId: ServiceInstanceId
  ): Promise<Organization | null> => {
    return db<Organization>('Organization')
      .leftJoin(
        'Subscription',
        'Subscription.organization_id',
        '=',
        'Organization.id'
      )
      .leftJoin(
        'ServiceInstance',
        'Subscription.service_instance_id',
        '=',
        'ServiceInstance.id'
      )
      .where({
        'ServiceInstance.id': serviceInstanceId,
      })
      .select('Organization.*')
      .first();
  },

  loadOrganizationsSubscribedToServiceInstance: async (
    serviceInstanceId: ServiceInstanceId
  ): Promise<Organization[]> => {
    return db<Organization>('Organization')
      .leftJoin(
        'Subscription',
        'Subscription.organization_id',
        '=',
        'Organization.id'
      )
      .leftJoin(
        'ServiceInstance',
        'Subscription.service_instance_id',
        '=',
        'ServiceInstance.id'
      )
      .where({
        'ServiceInstance.id': serviceInstanceId,
        'Subscription.status': 'ACCEPTED',
      })
      .whereIn('Subscription.joining', ['SELF_JOIN', 'AUTO_JOIN'])
      .distinct('Organization.id')
      .select('Organization.*');
  },
};

export const loadOrganizationsByUser = async (
  userId: UserId
): Promise<Organization[]> => {
  return db<Organization>('Organization')
    .leftJoin(
      'User_Organization',
      'User_Organization.organization_id',
      '=',
      'Organization.id'
    )
    .where('User_Organization.user_id', '=', userId)
    .select('Organization.*');
};

export const loadUserByOrganization = async (
  organizationId: OrganizationId
): Promise<User[]> => {
  return db<User>('User')
    .leftJoin('User_Organization', 'User_Organization.user_id', '=', 'User.id')
    .where('User_Organization.organization_id', '=', organizationId)
    .select('User.*');
};

export const loadOrganizationBy = async (
  conditions: OrganizationMutator
): Promise<Organization> => {
  return db<Organization>('Organization').where(conditions).select('*').first();
};

export const loadOrganizations = (opts: QueryOrganizationsArgs) => {
  const { first, after, orderMode, orderBy, searchTerm } = opts;
  return paginate<Organization, OrganizationConnection>('Organization', {
    first,
    after,
    orderMode,
    orderBy,
    searchTerm,
    filters: [
      {
        key: FilterKey.PersonalSpace,
        value: [false],
      } as unknown as Filter,
    ],
  });
};

export const insertNewOrganization = async (
  data: OrganizationInitializer
): Promise<Organization> => {
  const [createdOrganization] = await db<Organization>('Organization')
    .insert(data)
    .returning('*');

  return createdOrganization;
};

export const updateOrganizationBy = async (
  field: OrganizationMutator,
  data: OrganizationMutator
): Promise<Organization> => {
  const [updatedOrganization] = await db<Organization>('Organization')
    .where(field)
    .update(data)
    .returning('*');

  return updatedOrganization;
};

export const deleteOrganizationBy = async (
  conditions: OrganizationMutator
): Promise<Organization> => {
  try {
    const [deletedOrganization] = await db<Organization>('Organization')
      .where(conditions)
      .delete()
      .returning('*');
    return deletedOrganization;
  } catch (error) {
    const regexErrorName = /is still referenced from table "([^"]+)"/;
    const match =
      error.detail.match(regexErrorName) || error.message.match(regexErrorName);
    if (match) {
      const tableName = match[1];
      throw new Error(`${tableName.toUpperCase()}_STILL_IN_ORGANIZATION`);
    }

    throw error;
  }
};
