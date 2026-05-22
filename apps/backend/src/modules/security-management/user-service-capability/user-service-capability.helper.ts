import { fromGlobalId } from 'graphql-relay/node/node.js';
import { v4 as uuidv4 } from 'uuid';
import { db, dbRaw } from '../../../../knexfile';
import { Subscription } from '../../../__generated__/resolvers-types';
import { ServiceCapabilityId } from '../../../model/kanel/public/ServiceCapability';
import { SubscriptionCapabilityId } from '../../../model/kanel/public/SubscriptionCapability';
import UserService from '../../../model/kanel/public/UserService';
import UserServiceCapability, {
  UserServiceCapabilityId,
  UserServiceCapabilityInitializer,
} from '../../../model/kanel/public/UserServiceCapability';
import { ErrorCode } from '../../../utils/error/error.code';
import { loadGenericServiceCapabilityBy } from '../service-capability/generic-service-capability.helper';
import { loadServiceCapabilitiesBy } from '../service-capability/service-capability.domain';
import { loadSubscriptionCapabilitiesBy } from '../subscription-capability/subscription-capability.domain';

export const insertCapabilities = async (
  capabilities: string[],
  userServices: UserService[]
) => {
  for (const insertingCapability of capabilities) {
    const [genericCapability] = await loadGenericServiceCapabilityBy({
      name: insertingCapability,
    });

    if (genericCapability) {
      const data = userServices.map((us) => {
        return {
          id: uuidv4() as UserServiceCapabilityId,
          user_service_id: us.id,
          generic_service_capability_id: genericCapability.id,
          subscription_capability_id: null,
        };
      });
      await insertUserServiceCapability(data);
    } else {
      const [serviceCapability] = await loadServiceCapabilitiesBy({
        id: fromGlobalId(insertingCapability).id as ServiceCapabilityId,
      });

      const [subscriptionCapability] = await loadSubscriptionCapabilitiesBy({
        service_capability_id: serviceCapability.id,
        subscription_id: userServices[0].subscription_id,
      });
      const subscriptionCapabilities = await loadSubscriptionCapabilitiesBy({
        subscription_id: userServices[0].subscription_id,
      });
      const isCapabilityGrantedForOrganization = subscriptionCapabilities.some(
        (subscriptionCapability) => {
          return (
            subscriptionCapability.service_capability_id ===
            serviceCapability.id
          );
        }
      );

      if (isCapabilityGrantedForOrganization) {
        const data = userServices.map((us) => {
          return {
            id: uuidv4() as UserServiceCapabilityId,
            user_service_id: us.id,
            generic_service_capability_id: null,
            subscription_capability_id:
              subscriptionCapability.id as SubscriptionCapabilityId,
          };
        });
        await insertUserServiceCapability(data);
      } else {
        throw new Error(ErrorCode.GrantCapabilitiesOnOrganizationFirst);
      }
    }
  }
};

export const insertUserServiceCapability = async (
  data: UserServiceCapabilityInitializer[]
) => {
  if (data.length === 0) {
    return;
  }

  const toCapabilityKey = (
    capability: Pick<
      UserServiceCapabilityInitializer,
      | 'user_service_id'
      | 'generic_service_capability_id'
      | 'subscription_capability_id'
    >
  ) => {
    return [
      capability.user_service_id ?? '__NULL__',
      capability.generic_service_capability_id ?? '__NULL__',
      capability.subscription_capability_id ?? '__NULL__',
    ].join('|');
  };

  const userServiceIds = data
    .map((capability) => capability.user_service_id)
    .filter((id): id is NonNullable<typeof id> => Boolean(id));

  const existingRows = userServiceIds.length
    ? await db<UserServiceCapability>('UserService_Capability')
        .whereIn('user_service_id', userServiceIds)
        .select(
          'user_service_id',
          'generic_service_capability_id',
          'subscription_capability_id'
        )
    : [];

  const existingKeys = new Set(existingRows.map(toCapabilityKey));
  const rowsToInsert: UserServiceCapabilityInitializer[] = [];

  for (const capability of data) {
    const key = toCapabilityKey(capability);
    if (existingKeys.has(key)) {
      continue;
    }

    existingKeys.add(key);
    rowsToInsert.push(capability);
  }

  if (rowsToInsert.length === 0) {
    return;
  }

  await db<UserServiceCapability>('UserService_Capability')
    .insert(rowsToInsert)
    .returning('*');
};

export const loadCapabilities = async (serviceInstanceId, userId, orgaId) => {
  const [subscriptionWithCapabilities] = await db<Subscription>('Subscription')
    .where('Subscription.service_instance_id', '=', serviceInstanceId)
    .where('Subscription.organization_id', '=', orgaId)
    .leftJoin('User_Service', function () {
      this.on('User_Service.subscription_id', '=', 'Subscription.id')

        .andOnVal('User_Service.user_id', '=', userId);
    })
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
      dbRaw(
        `COALESCE(
          json_agg(
            COALESCE("Generic_Service_Capability".name, "Service_Capability".name)
          ), '[]'::json
        ) AS capabilities`
      )
    );
  return subscriptionWithCapabilities.capabilities;
};
