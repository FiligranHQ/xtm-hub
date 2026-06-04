import { db } from '../../../../knexfile';
import { PlatformIdentifier } from '../../../__generated__/resolvers-types';
import ServiceDefinition, {
  ServiceDefinitionMutator,
} from '../../../model/kanel/public/ServiceDefinition';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import { serviceDefinitionIdentifierMappedByPlatformIdentifier } from '../../registration/registration.mapping';

export const ServiceDefinitionDomain = {
  loadServiceDefinitionBy(
    field: ServiceDefinitionMutator
  ): Promise<ServiceDefinition | undefined> {
    return db<ServiceDefinition>('ServiceDefinition')
      .where(field)
      .select('*')
      .first();
  },

  loadServiceDefinitionByServiceInstanceSlug(
    serviceInstanceSlug: string
  ): Promise<ServiceDefinition | undefined> {
    return db<ServiceDefinition>('ServiceDefinition')
      .leftJoin(
        'ServiceInstance',
        'ServiceInstance.service_definition_id',
        '=',
        'ServiceDefinition.id'
      )
      .where('ServiceInstance.slug', '=', serviceInstanceSlug)
      .select('ServiceDefinition.*')
      .first();
  },

  loadServiceDefinitionByServiceInstance(
    serviceInstanceId: ServiceInstanceId
  ): Promise<ServiceDefinition | undefined> {
    return db<ServiceDefinition>('ServiceDefinition')
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

  async loadServiceDefinitionByPlatformIdentifier(
    platformIdentifier: PlatformIdentifier
  ): Promise<ServiceDefinition | undefined> {
    const serviceDefinitionIdentifier =
      serviceDefinitionIdentifierMappedByPlatformIdentifier[platformIdentifier];

    if (!serviceDefinitionIdentifier) {
      return undefined;
    }

    return ServiceDefinitionDomain.loadServiceDefinitionBy({
      identifier: serviceDefinitionIdentifier,
    });
  },
};
