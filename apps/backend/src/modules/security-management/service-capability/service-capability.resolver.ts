import { Resolvers } from '../../../__generated__/resolvers-types';
import { ServiceCapabilityId } from '../../../model/kanel/public/ServiceCapability';
import { createRelayIdScalar } from '../../../utils/scalar.util';
import { ServiceCapabilityApp } from './service-capability.app';

const resolvers: Resolvers = {
  ServiceCapabilityId:
    createRelayIdScalar<ServiceCapabilityId>('Service_Capability'),
  Query: {
    userServiceCapabilities: async (_, { service_instance_id }) => {
      return ServiceCapabilityApp.loadServiceCapabilitiesByServiceId(
        service_instance_id
      );
    },
  },
};
export default resolvers;
