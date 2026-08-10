import { fromGlobalId } from 'graphql-relay/node/node.js';
import { v4 as uuidv4 } from 'uuid';
import { db, dbRaw } from '../../../../knexfile';
import { Subscription } from '../../../__generated__/resolvers-types';
import { GenericServiceCapabilityId } from '../../../model/kanel/public/GenericServiceCapability';
import { OrganizationId } from '../../../model/kanel/public/Organization';
import { ServiceCapabilityId } from '../../../model/kanel/public/ServiceCapability';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import SubscriptionCapability, {
  SubscriptionCapabilityId,
} from '../../../model/kanel/public/SubscriptionCapability';
import { UserId } from '../../../model/kanel/public/User';
import UserService from '../../../model/kanel/public/UserService';
import UserServiceCapability, {
  UserServiceCapabilityId,
  UserServiceCapabilityInitializer,
} from '../../../model/kanel/public/UserServiceCapability';
import { buildTupleFilter } from '../../../utils/batch-query.util';
import { ErrorCode, UnknownErrorCode } from '../../../utils/error/error.code';
import { serviceInstanceUserOrganizationKey } from '../../service/instance/service-instance.keys';
import { GenericServiceCapabilityHelper } from '../service-capability/generic-service-capability.helper';
import { ServiceCapabilityDomain } from '../service-capability/service-capability.domain';
import { SubscriptionCapabilityDomain } from '../subscription-capability/subscription-capability.domain';

export const UserServiceCapabilityHelper = {
  insertCapabilities: async (
    capabilities: string[],
    userServices: UserService[]
  ) => {
    for (const insertingCapability of capabilities) {
      const [genericCapability] =
        await GenericServiceCapabilityHelper.loadGenericServiceCapabilityBy({
          name: insertingCapability,
        });

      if (genericCapability) {
        const data: UserServiceCapabilityInitializer[] = userServices.map(
          (us) => {
            return {
              id: uuidv4() as UserServiceCapabilityId,
              user_service_id: us.id,
              generic_service_capability_id:
                genericCapability.id as GenericServiceCapabilityId,
              subscription_capability_id:
                null as SubscriptionCapabilityId | null,
            };
          }
        );
        await UserServiceCapabilityHelper.insertUserServiceCapability(data);
      } else {
        const [firstUserService] = userServices;
        if (!firstUserService) {
          throw new Error(UnknownErrorCode.UnknownError);
        }

        const [serviceCapability] =
          await ServiceCapabilityDomain.loadServiceCapabilitiesBy({
            id: fromGlobalId(insertingCapability).id as ServiceCapabilityId,
          });

        if (!serviceCapability) {
          throw new Error(UnknownErrorCode.UnknownError);
        }

        const [subscriptionCapability] =
          await SubscriptionCapabilityDomain.loadSubscriptionCapabilitiesBy({
            service_capability_id: serviceCapability.id,
            subscription_id: firstUserService.subscription_id,
          });
        const subscriptionCapabilities =
          await SubscriptionCapabilityDomain.loadSubscriptionCapabilitiesBy({
            subscription_id: firstUserService.subscription_id,
          });
        const isCapabilityGrantedForOrganization =
          subscriptionCapabilities.some(
            (subscriptionCapability: SubscriptionCapability) => {
              return (
                subscriptionCapability.service_capability_id ===
                serviceCapability.id
              );
            }
          );

        if (isCapabilityGrantedForOrganization) {
          const data: UserServiceCapabilityInitializer[] = userServices.map(
            (us) => {
              return {
                id: uuidv4() as UserServiceCapabilityId,
                user_service_id: us.id,
                generic_service_capability_id:
                  null as GenericServiceCapabilityId | null,
                subscription_capability_id:
                  subscriptionCapability?.id as SubscriptionCapabilityId,
              };
            }
          );
          await UserServiceCapabilityHelper.insertUserServiceCapability(data);
        } else {
          throw new Error(ErrorCode.GrantCapabilitiesOnOrganizationFirst);
        }
      }
    }
  },

  insertUserServiceCapability: async (
    data: UserServiceCapabilityInitializer[]
  ) => {
    if (data.length === 0) {
      return;
    }

    await db<UserServiceCapability>('UserService_Capability')
      .insert(data)
      .onConflict([
        'user_service_id',
        'generic_service_capability_id',
        'subscription_capability_id',
      ])
      .ignore()
      .returning('*');
  },

  loadCapabilitiesByKeys: async (
    keys: readonly {
      serviceInstanceId: ServiceInstanceId;
      userId: UserId;
      organizationId: OrganizationId;
    }[]
  ): Promise<string[][]> => {
    const { columns, tuples } = buildTupleFilter(keys, [
      {
        column: 'Subscription.service_instance_id',
        value: (key) => key.serviceInstanceId,
      },
      {
        column: 'Subscription.organization_id',
        value: (key) => key.organizationId,
      },
      { column: 'User_Service.user_id', value: (key) => key.userId },
    ]);

    if (tuples.length === 0) {
      return [];
    }

    const rows: {
      service_instance_id: ServiceInstanceId;
      organization_id: OrganizationId;
      user_id: UserId;
      capability: string | null;
    }[] = await db<Subscription>('Subscription')
      .join(
        'User_Service',
        'User_Service.subscription_id',
        '=',
        'Subscription.id'
      )
      .whereIn(columns, tuples)
      .leftJoin(
        'UserService_Capability',
        'UserService_Capability.user_service_id',
        '=',
        'User_Service.id'
      )
      .leftJoin(
        'Subscription_Capability',
        'UserService_Capability.subscription_capability_id',
        '=',
        'Subscription_Capability.id'
      )
      .leftJoin(
        'Service_Capability',
        'Subscription_Capability.service_capability_id',
        '=',
        'Service_Capability.id'
      )
      .leftJoin(
        'Generic_Service_Capability',
        'UserService_Capability.generic_service_capability_id',
        '=',
        'Generic_Service_Capability.id'
      )
      .select(
        'Subscription.service_instance_id',
        'Subscription.organization_id',
        'User_Service.user_id',
        dbRaw(
          `COALESCE("Generic_Service_Capability".name, "Service_Capability".name) AS capability`
        )
      );

    const map = new Map<string, string[]>();
    for (const row of rows) {
      if (!row.capability) {
        continue;
      }
      const key = serviceInstanceUserOrganizationKey.create({
        serviceInstanceId: row.service_instance_id,
        userId: row.user_id,
        organizationId: row.organization_id,
      });
      const capabilities = map.get(key) ?? [];
      capabilities.push(row.capability);
      map.set(key, capabilities);
    }

    return keys.map(
      ({ serviceInstanceId, userId, organizationId }) =>
        map.get(
          serviceInstanceUserOrganizationKey.create({
            serviceInstanceId,
            userId,
            organizationId,
          })
        ) ?? []
    );
  },

  loadCapabilities: async (
    serviceInstanceId: ServiceInstanceId,
    userId: UserId,
    orgaId: OrganizationId
  ) => {
    const [capabilities] =
      await UserServiceCapabilityHelper.loadCapabilitiesByKeys([
        { serviceInstanceId, userId, organizationId: orgaId },
      ]);
    return capabilities;
  },
};
