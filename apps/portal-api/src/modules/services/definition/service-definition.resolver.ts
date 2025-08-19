import { Resolvers } from '../../../__generated__/resolvers-types';
import { ServiceCapabilityMutator } from '../../../model/kanel/public/ServiceCapability';
import { loadServiceCapabilitiesBy } from './service-capability/service-capability.domain';

const resolvers: Resolvers = {
  ServiceDefinition: {
    service_capability: ({ id }, _, context) =>
      loadServiceCapabilitiesBy(context, {
        service_definition_id: id,
      } as ServiceCapabilityMutator),
  },
};

export default resolvers;
