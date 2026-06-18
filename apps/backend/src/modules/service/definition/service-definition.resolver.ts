import { Resolvers } from '../../../__generated__/resolvers-types';
import { ServiceCapabilityMutator } from '../../../model/kanel/public/ServiceCapability';
import { ServiceCapabilityDomain } from '../../security-management/service-capability/service-capability.domain';

const resolvers: Resolvers = {
  ServiceDefinition: {
    service_capability: ({ id }, _) =>
      ServiceCapabilityDomain.loadServiceCapabilitiesBy({
        service_definition_id: id,
      } as ServiceCapabilityMutator),
  },
};

export default resolvers;
