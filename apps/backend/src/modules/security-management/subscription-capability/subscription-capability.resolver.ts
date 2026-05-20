import {
  Resolvers,
  SubscriptionModel,
} from '../../../__generated__/resolvers-types';
import { SubscriptionCapabilityId } from '../../../model/kanel/public/SubscriptionCapability';
import { UnknownErrorCode } from '../../../utils/error/error.code';
import { mapToGraphQLError } from '../../../utils/error/error.mapping';
import { createRelayIdScalar } from '../../../utils/scalar.util';
import { SubscriptionCapabilityApp } from './subscription-capability.app';

const resolvers: Resolvers = {
  SubscriptionCapabilityId: createRelayIdScalar<SubscriptionCapabilityId>(
    'Subscription_Capability'
  ),
  Mutation: {
    addSubscriptionCapability: async (_, { input }) => {
      try {
        return (await SubscriptionCapabilityApp.addSubscriptionsCapabilities(
          input.subscriptionsId,
          input.capabilitiesId
        )) as unknown as SubscriptionModel[];
      } catch (error) {
        throw mapToGraphQLError(error, UnknownErrorCode.AddCapabilitiesError);
      }
    },
  },
};
export default resolvers;
