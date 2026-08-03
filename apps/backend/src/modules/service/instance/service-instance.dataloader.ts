import DataLoader from 'dataloader';
import {
  ServiceDefinition,
  ServiceLink,
  SubscriptionModel,
} from '../../../__generated__/resolvers-types';
import { OrganizationId } from '../../../model/kanel/public/Organization';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import { UserId } from '../../../model/kanel/public/User';
import { UserServiceCapabilityHelper } from '../../security-management/user-service-capability/user-service-capability.helper';
import { ServiceInstanceDomain } from './service-instance.domain';

const KEY_SEPARATOR = ':';

// `organization_subscribed` and `subscriptions` share the same key shape.
type OrganizationServiceInstanceKey =
  `${OrganizationId}${typeof KEY_SEPARATOR}${ServiceInstanceId}`;

export const createOrganizationServiceInstanceKey = ({
  organizationId,
  serviceInstanceId,
}: {
  organizationId: OrganizationId;
  serviceInstanceId: ServiceInstanceId;
}): OrganizationServiceInstanceKey =>
  `${organizationId}${KEY_SEPARATOR}${serviceInstanceId}`;

const parseOrganizationServiceInstanceKey = (
  key: OrganizationServiceInstanceKey
): { organizationId: OrganizationId; serviceInstanceId: ServiceInstanceId } => {
  const [organizationId, serviceInstanceId] = key.split(KEY_SEPARATOR) as [
    OrganizationId,
    ServiceInstanceId,
  ];
  return { organizationId, serviceInstanceId };
};

// `capabilities` and `user_joined` share the same key shape.
type ServiceInstanceUserOrganizationKey =
  `${ServiceInstanceId}${typeof KEY_SEPARATOR}${UserId}${typeof KEY_SEPARATOR}${OrganizationId}`;

export const createServiceInstanceUserOrganizationKey = ({
  serviceInstanceId,
  userId,
  organizationId,
}: {
  serviceInstanceId: ServiceInstanceId;
  userId: UserId;
  organizationId: OrganizationId;
}): ServiceInstanceUserOrganizationKey =>
  `${serviceInstanceId}${KEY_SEPARATOR}${userId}${KEY_SEPARATOR}${organizationId}`;

const parseServiceInstanceUserOrganizationKey = (
  key: ServiceInstanceUserOrganizationKey
): {
  serviceInstanceId: ServiceInstanceId;
  userId: UserId;
  organizationId: OrganizationId;
} => {
  const [serviceInstanceId, userId, organizationId] = key.split(
    KEY_SEPARATOR
  ) as [ServiceInstanceId, UserId, OrganizationId];
  return { serviceInstanceId, userId, organizationId };
};

export interface ServiceInstanceDataLoaders {
  linksByServiceInstanceLoader: DataLoader<ServiceInstanceId, ServiceLink[]>;
  serviceDefinitionByServiceInstanceLoader: DataLoader<
    ServiceInstanceId,
    ServiceDefinition | undefined
  >;
  organizationSubscribedLoader: DataLoader<
    OrganizationServiceInstanceKey,
    boolean
  >;
  capabilitiesLoader: DataLoader<ServiceInstanceUserOrganizationKey, string[]>;
  userJoinedLoader: DataLoader<ServiceInstanceUserOrganizationKey, boolean>;
  subscriptionsByServiceInstanceLoader: DataLoader<
    OrganizationServiceInstanceKey,
    SubscriptionModel[]
  >;
}

export const ServiceInstanceDataLoader = {
  batchLoadLinks: async (
    ids: readonly ServiceInstanceId[]
  ): Promise<ServiceLink[][]> => {
    const rows = await ServiceInstanceDomain.loadLinksByServiceInstanceIds(ids);

    const map = new Map<string, ServiceLink[]>();
    for (const row of rows) {
      const serviceInstanceId = row.service_instance_id as ServiceInstanceId;
      const existing = map.get(serviceInstanceId) ?? [];
      existing.push(row);
      map.set(serviceInstanceId, existing);
    }
    return ids.map((id) => map.get(id) ?? []);
  },

  batchLoadServiceDefinitions: async (
    ids: readonly ServiceInstanceId[]
  ): Promise<(ServiceDefinition | undefined)[]> => {
    const rows =
      await ServiceInstanceDomain.loadServiceDefinitionsByServiceInstanceIds(
        ids
      );

    const map = new Map<string, ServiceDefinition>(
      rows.map((row) => [row.service_instance_id, row])
    );
    return ids.map((id) => map.get(id));
  },

  batchLoadOrganizationSubscribed: async (
    keys: readonly OrganizationServiceInstanceKey[]
  ): Promise<boolean[]> => {
    const parsedKeys = keys.map(parseOrganizationServiceInstanceKey);
    const rows = await ServiceInstanceDomain.loadIsSubscribedByKeys(parsedKeys);

    const subscribedKeys = new Set(
      rows.map((row) =>
        createOrganizationServiceInstanceKey({
          organizationId: row.organization_id,
          serviceInstanceId: row.service_instance_id,
        })
      )
    );
    return keys.map((key) => subscribedKeys.has(key));
  },

  batchLoadCapabilities: async (
    keys: readonly ServiceInstanceUserOrganizationKey[]
  ): Promise<string[][]> => {
    const parsedKeys = keys.map(parseServiceInstanceUserOrganizationKey);
    return UserServiceCapabilityHelper.loadCapabilitiesByKeys(parsedKeys);
  },

  batchLoadUserJoined: async (
    keys: readonly ServiceInstanceUserOrganizationKey[]
  ): Promise<boolean[]> => {
    const parsedKeys = keys.map(parseServiceInstanceUserOrganizationKey);
    const rows =
      await ServiceInstanceDomain.loadJoinedUserServiceKeys(parsedKeys);

    const joinedKeys = new Set(
      rows.map((row) =>
        createServiceInstanceUserOrganizationKey({
          serviceInstanceId: row.service_instance_id,
          userId: row.user_id,
          organizationId: row.organization_id,
        })
      )
    );
    return keys.map((key) => joinedKeys.has(key));
  },

  batchLoadSubscriptions: async (
    keys: readonly OrganizationServiceInstanceKey[]
  ): Promise<SubscriptionModel[][]> => {
    const parsedKeys = keys.map(parseOrganizationServiceInstanceKey);
    const serviceInstanceIds = [
      ...new Set(parsedKeys.map(({ serviceInstanceId }) => serviceInstanceId)),
    ];
    const rows =
      await ServiceInstanceDomain.loadServiceInstanceSubscriptionsByIds(
        serviceInstanceIds
      );

    const map = new Map<string, SubscriptionModel[]>();
    for (const row of rows) {
      const existing = map.get(row.service_instance_id) ?? [];
      existing.push(row as unknown as SubscriptionModel);
      map.set(row.service_instance_id, existing);
    }

    return parsedKeys.map(
      ({ serviceInstanceId }) => map.get(serviceInstanceId) ?? []
    );
  },

  create: (): ServiceInstanceDataLoaders => ({
    linksByServiceInstanceLoader: new DataLoader(
      ServiceInstanceDataLoader.batchLoadLinks
    ),
    serviceDefinitionByServiceInstanceLoader: new DataLoader(
      ServiceInstanceDataLoader.batchLoadServiceDefinitions
    ),
    organizationSubscribedLoader: new DataLoader(
      ServiceInstanceDataLoader.batchLoadOrganizationSubscribed
    ),
    capabilitiesLoader: new DataLoader(
      ServiceInstanceDataLoader.batchLoadCapabilities
    ),
    userJoinedLoader: new DataLoader(
      ServiceInstanceDataLoader.batchLoadUserJoined
    ),
    subscriptionsByServiceInstanceLoader: new DataLoader(
      ServiceInstanceDataLoader.batchLoadSubscriptions
    ),
  }),
};
