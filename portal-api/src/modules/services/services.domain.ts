import { db, dbRaw, dbUnsecure, paginate } from '../../../knexfile';
import {
  Service,
  ServiceConnection,
  ServiceLink,
} from '../../__generated__/resolvers-types';
import { PortalContext } from '../../model/portal-context';
import { ServiceLinkInitializer } from '../../model/kanel/public/ServiceLink';
import { ServiceId, ServiceMutator } from '../../model/kanel/public/Service';
import { RolePortal } from '../../model/user';
import { fromGlobalId } from 'graphql-relay/node/node.js';
import { SubscriptionId } from '../../model/kanel/public/Subscription';
import { v4 as uuidv4 } from 'uuid';
import { loadUsersByOrganization } from '../users/users.domain';
import { UserServiceId } from '../../model/kanel/public/UserService';
import { ServiceCapabilityId } from '../../model/kanel/public/ServiceCapability';
import {
  insertSubscription,
  loadUnsecureSubscriptionBy,
} from '../subcription/subscription.domain';
import { insertUserService } from '../user_service/user_service.domain';
import { insertServiceCapability } from './instances/service-capabilities/service_capabilities.helper';
import { OrganizationId } from '../../model/kanel/public/Organization';

export const loadCommunities = async (context: PortalContext, opts) => {
  const { first, after, orderMode, orderBy } = opts;
  const query = await paginate<Service>(context, 'Service', {
    first,
    after,
    orderMode,
    orderBy,
  })
    .leftJoin(
      'Subscription as subscription',
      'subscription.service_id',
      '=',
      'Service.id'
    )
    .where('type', '=', 'COMMUNITY')
    .select(
      'Service.*',
      dbRaw(
        "(json_agg(CASE WHEN 'subscription.id' IS NOT NULL THEN json_build_object('id', \"subscription\".id, 'status', \"subscription\".status, 'start_date', \"subscription\".start_date, 'end_date', \"subscription\".end_date, '__typename', 'Subscription') ELSE NULL END) FILTER (WHERE \"subscription\".id IS NOT NULL))::json as subscription"
      )
    )
    .groupBy(['Service.id', 'subscription.id'])
    .asConnection<ServiceConnection>();

  const { totalCount } = await db<Service>(context, 'Service', opts)
    .where('type', '=', 'COMMUNITY')
    .countDistinct('Service.id as totalCount')
    .first();

  return {
    totalCount,
    ...query,
  };
};

export const loadPublicServices = async (
  context: PortalContext,
  opts,
  publicOnly = true,
  communities = false
) => {
  const { first, after, orderMode, orderBy } = opts;
  const query = paginate<Service>(context, 'Service', {
    first,
    after,
    orderMode,
    orderBy,
  });

  if (publicOnly) {
    query.where('type', '!=', 'PRIVATE');
  }
  if (communities) {
    query.where('type', '=', 'COMMUNITY');
  } else {
    query.where('type', '!=', 'COMMUNITY');
  }

  const servicesConnection = await query
    .leftJoin(
      'Subscription as subscription',
      'subscription.service_id',
      '=',
      'Service.id'
    )
    .leftJoin(
      'Organization as org',
      'subscription.organization_id',
      '=',
      'org.id'
    )
    .leftJoin('Service_Link as link', 'Service.id', '=', 'link.service_id')
    .select([
      'Service.*',
      dbRaw('((subscription.status)) as status'),
      dbRaw('(json_agg(org.*))::json as organization'),
      dbRaw(
        "(json_agg(json_build_object('id', \"subscription\".id, 'status', \"subscription\".status, 'start_date', \"subscription\".start_date, 'end_date', \"subscription\".end_date, 'organization', json_build_object('id', \"org\".id,'name', \"org\".name,'__typename', 'Organization'),'__typename', 'Subscription')))::json as subscription"
      ),

      dbRaw('row_to_json(link.*) as links'),
    ])
    .groupBy(['Service.id', 'link.*', 'subscription.status'])
    .asConnection<ServiceConnection>();

  const queryCount = db<Service>(context, 'Service', opts);
  if (publicOnly) {
    queryCount.where('type', '!=', 'PRIVATE');
  }
  if (communities) {
    queryCount.where('type', '=', 'COMMUNITY');
  } else {
    query.where('type', '!=', 'COMMUNITY');
  }
  queryCount.countDistinct('Service.id as totalCount').first();

  const { totalCount } = await queryCount;

  return {
    totalCount,
    ...servicesConnection,
  };
};

export const loadServiceBy = async (
  context: PortalContext,
  field: string,
  value: string
): Promise<Service> => {
  const service = await db<Service>(context, 'Service')
    .where({ [field]: value })
    .select('*')
    .first();
  return service;
};

export const loadUnsecureServiceBy = async (field: ServiceMutator) => {
  return dbUnsecure<Service>('Service').where(field);
};

export const addServiceLink = async (
  context: PortalContext,
  dataServiceLink: ServiceLinkInitializer
): Promise<ServiceLink> => {
  const [serviceLink] = await db<ServiceLink>(context, 'Service_Link')
    .insert(dataServiceLink)
    .returning('*');
  return serviceLink;
};

export const insertService = async (context: PortalContext, dataService) => {
  return db<Service>(context, 'Service').insert(dataService).returning('*');
};

export const grantCommunityAccess = async (
  context: PortalContext,
  organizationsId: string[],
  role: RolePortal,
  addedService: Service,
  userId: string,
  userOrganizationId: OrganizationId
) => {
  for (const organization_id of organizationsId) {
    const dataSubscription = {
      id: uuidv4() as unknown as SubscriptionId,
      organization_id: fromGlobalId(organization_id).id,
      service_id: addedService.id,
      start_date: new Date(),
      end_date: null,
      status: role.name === 'ADMIN' ? 'ACCEPTED' : 'REQUESTED',
    };
    const [addedSubscription] = await insertSubscription(
      context,
      dataSubscription
    );

    const users = await loadUsersByOrganization(
      fromGlobalId(organization_id).id,
      userId
    );
    const capabilitiesUsers = ['ACCESS_SERVICE'];
    for (const user of users) {
      await grantServiceAccess(
        context,
        capabilitiesUsers,
        user.id,
        addedSubscription.id
      );
    }
  }

  const capabilitiesAdmin = [
    'ADMIN_SUBSCRIPTION',
    'MANAGE_ACCESS',
    'ACCESS_SERVICE',
  ];

  let [retrievedSubscription] = await loadUnsecureSubscriptionBy({
    service_id: addedService.id as ServiceId,
    organization_id: userOrganizationId,
  });
  if (!retrievedSubscription) {
    const dataSubscription = {
      id: uuidv4() as unknown as SubscriptionId,
      organization_id: userOrganizationId,
      service_id: addedService.id,
      start_date: new Date(),
      end_date: null,
      status: role.name === 'ADMIN' ? 'ACCEPTED' : 'REQUESTED',
    };
    const [addedSubscription] = await insertSubscription(
      context,
      dataSubscription
    );
    retrievedSubscription = addedSubscription;
  }
  await grantServiceAccess(
    context,
    capabilitiesAdmin,
    userId,
    retrievedSubscription.id
  );
};

export const grantServiceAccess = async (
  context: PortalContext,
  capabilities: string[],
  userId: string,
  subscriptionId: string
) => {
  const dataUserService = {
    id: uuidv4() as UserServiceId,
    user_id: userId,
    subscription_id: subscriptionId,
  };
  const [insertedUserService] = await insertUserService(
    context,
    dataUserService
  );

  for (const capability of capabilities) {
    const dataServiceCapability = {
      id: uuidv4() as ServiceCapabilityId,
      user_service_id: insertedUserService.id,
      service_capability_name: capability,
    };
    await insertServiceCapability(context, dataServiceCapability);
  }
};