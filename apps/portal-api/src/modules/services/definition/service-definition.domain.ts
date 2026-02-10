import { db } from '../../../../knexfile';
import { PlatformIdentifier } from '../../../__generated__/resolvers-types';
import ServiceDefinition, {
  ServiceDefinitionMutator,
} from '../../../model/kanel/public/ServiceDefinition';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import { serviceDefinitionIdentifierMappedByPlatformIdentifier } from '../registration/registration.mapping';

export const serviceDefinitionDomain = {
  loadServiceDefinitionBy(
    field: ServiceDefinitionMutator
  ): Promise<ServiceDefinition | undefined> {
    return db('ServiceDefinition').where(field).select('id').first();
  },

  loadServiceDefinitionByServiceInstance(
    serviceInstanceId: ServiceInstanceId
  ): Promise<ServiceDefinition | undefined> {
    return db('ServiceDefinition')
      .leftJoin(
        'ServiceInstance',
        'ServiceInstance.service_definition_id',
        '=',
        'ServiceDefinition.id'
      )
      .where('ServiceInstance.id', '=', serviceInstanceId)
      .select('ServiceDefinition.*')
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
