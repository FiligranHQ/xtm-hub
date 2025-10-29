import { db } from '../../../../knexfile';
import { PlatformIdentifier } from '../../../__generated__/resolvers-types';
import { requestContext } from '../../../context/request.context';
import ServiceDefinition, {
  ServiceDefinitionMutator,
} from '../../../model/kanel/public/ServiceDefinition';
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
