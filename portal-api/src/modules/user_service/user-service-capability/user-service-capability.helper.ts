import { fromGlobalId } from 'graphql-relay/node/node.js';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../../../knexfile';
import { ServiceCapabilityId } from '../../../model/kanel/public/ServiceCapability';
import { SubscriptionCapabilityId } from '../../../model/kanel/public/SubscriptionCapability';
import UserService from '../../../model/kanel/public/UserService';
import UserServiceCapability, {
  UserServiceCapabilityId,
} from '../../../model/kanel/public/UserServiceCapability';
import { UnknownError } from '../../../utils/error.util';
import { loadSubscriptionCapabilitiesBy } from '../../services/instances/service-capabilities/service_capabilities.helper';
import { loadGenericServiceCapabilityBy } from '../service-capability/generic_service_capability.helper';
import { loadServiceCapabilityBy } from '../service-capability/service_capability.helper';
import { loadSubscriptionCapabilityBy } from '../service-capability/subscription_capability.helper';

export const insertCapabilities = async (
  context,
  trx,
  capabilities: string[],
  userService: UserService
) => {
  for (const insertingCapability of capabilities) {
    const [genericCapability] = await loadGenericServiceCapabilityBy({
      name: insertingCapability,
    });

    if (genericCapability) {
      await insertUserServiceCapability(context, {
        id: uuidv4() as UserServiceCapabilityId,
        user_service_id: userService.id,
        generic_service_capability_id: genericCapability.id,
      });
    } else {
      const [serviceCapability] = await loadServiceCapabilityBy({
        id: fromGlobalId(insertingCapability).id as ServiceCapabilityId,
      });

      const [subscriptionCapability] = await loadSubscriptionCapabilityBy({
        service_capability_id: serviceCapability.id,
        subscription_id: userService.subscription_id,
      });

      const subscriptionCapabilities = await loadSubscriptionCapabilitiesBy(
        context,
        {
          subscription_id: userService.subscription_id,
        }
      );
      const isCapabilityGrantedForOrganization = subscriptionCapabilities.some(
        (subscriptionCapability) => {
          return (
            subscriptionCapability.service_capability_id ===
            serviceCapability.id
          );
        }
      );
      if (isCapabilityGrantedForOrganization) {
        await db<UserServiceCapability>(context, 'UserService_Capability')
          .insert({
            id: uuidv4() as UserServiceCapabilityId,
            user_service_id: userService.id,
            subscription_capability_id:
              subscriptionCapability.id as SubscriptionCapabilityId,
          })
          .transacting(trx);
      } else {
        throw UnknownError('CAPABILITIES_ERROR', {
          detail: 'Grant the capability on an organization level first.',
        });
      }
    }
  }
};

export const insertUserServiceCapability = async (context, data) => {
  await db<UserServiceCapability>(context, 'UserService_Capability')
    .insert(data)
    .returning('*');
};
