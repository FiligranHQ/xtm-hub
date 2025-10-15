import { db } from '../../../../knexfile';
import { PlatformIdentifier } from '../../../__generated__/resolvers-types';
import ServiceDefinition, {
  ServiceDefinitionMutator,
} from '../../../model/kanel/public/ServiceDefinition';
import { PortalContext } from '../../../model/portal-context';
import { serviceDefinitionIdentifierMappedByPlatformIdentifier } from '../registration/registration.mapping';

export const serviceDefinitionDomain = {
  loadServiceDefinitionBy(
    context: PortalContext,
    field: ServiceDefinitionMutator
  ): Promise<ServiceDefinition> {
    return db(context, 'ServiceDefinition').where(field).select('id').first();
  },

  loadServiceDefinitionByPlatformIdentifier(
    context: PortalContext,
    platformIdentifier: PlatformIdentifier
  ): Promise<ServiceDefinition> {
    const serviceDefinitionIdentifier =
      serviceDefinitionIdentifierMappedByPlatformIdentifier[platformIdentifier];

    return serviceDefinitionDomain.loadServiceDefinitionBy(context, {
      identifier: serviceDefinitionIdentifier,
    });
  },
};
