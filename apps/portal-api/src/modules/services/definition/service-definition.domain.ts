import { db } from '../../../../knexfile';
import { PlatformIdentifier } from '../../../__generated__/resolvers-types';
import ServiceDefinition, {
  ServiceDefinitionMutator,
} from '../../../model/kanel/public/ServiceDefinition';
import { serviceDefinitionIdentifierMappedByPlatformIdentifier } from '../registration/registration.mapping';

export const serviceDefinitionDomain = {
  loadServiceDefinitionBy(
    field: ServiceDefinitionMutator
  ): Promise<ServiceDefinition> {
    return db('ServiceDefinition').where(field).select('id').first();
  },

  loadServiceDefinitionByPlatformIdentifier(
    platformIdentifier: PlatformIdentifier
  ): Promise<ServiceDefinition> {
    const serviceDefinitionIdentifier =
      serviceDefinitionIdentifierMappedByPlatformIdentifier[platformIdentifier];

    return serviceDefinitionDomain.loadServiceDefinitionBy({
      identifier: serviceDefinitionIdentifier,
    });
  },
};
