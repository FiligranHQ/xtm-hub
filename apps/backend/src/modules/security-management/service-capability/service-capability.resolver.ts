import { Resolvers } from '../../../__generated__/resolvers-types';
import { ServiceCapabilityId } from '../../../model/kanel/public/ServiceCapability';
import { createRelayIdScalar } from '../../../utils/scalar.util';

const resolvers: Resolvers = {
  ServiceCapabilityId:
    createRelayIdScalar<ServiceCapabilityId>('Service_Capability'),
};
export default resolvers;
