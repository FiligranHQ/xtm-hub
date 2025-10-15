import { db } from '../../../../knexfile';
import { PlatformIdentifier } from '../../../__generated__/resolvers-types';
import ServiceDefinition, {
  ServiceDefinitionMutator,
} from '../../../model/kanel/public/ServiceDefinition';
import { requestContext } from '../../../requestContext';
import { serviceDefinitionIdentifierMappedByPlatformIdentifier } from '../registration/registration.mapping';

export const serviceDefinitionDomain = {
  loadServiceDefinitionBy(
    field: ServiceDefinitionMutator
  ): Promise<ServiceDefinition> {
    const context = requestContext.require();
    return db(context.portalContext, 'ServiceDefinition')
      .where(field)
      .select('id')
      .first();
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
