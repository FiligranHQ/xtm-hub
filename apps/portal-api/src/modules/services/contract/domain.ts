import { JSONSchemaToZod } from '@dmitryrechkin/json-schema-to-zod';
import { db } from '../../../../knexfile';
import { ServiceConfigurationStatus } from '../../../__generated__/resolvers-types';
import ServiceConfiguration, {
  ServiceConfigurationMutator,
} from '../../../model/kanel/public/ServiceConfiguration';
import ServiceContract, {
  ServiceContractMutator,
} from '../../../model/kanel/public/ServiceContract';
import { ServiceDefinitionId } from '../../../model/kanel/public/ServiceDefinition';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import { PortalContext } from '../../../model/portal-context';
import { ErrorCode } from '../../common/error-code';

const loadServiceContractBy = async (
  context: PortalContext,
  field: ServiceContractMutator
): Promise<ServiceContract> => {
  return db(context, 'Service_Contract').where(field).select('*').first();
};

export const serviceContractDomain = {
  isServiceConfigurationValid: async (
    context: PortalContext,
    serviceDefinitionId: ServiceDefinitionId,
    config: Record<string, unknown>
  ): Promise<boolean> => {
    const serviceContract = await loadServiceContractBy(context, {
      service_definition_id: serviceDefinitionId,
    });
    if (!serviceContract) {
      throw new Error(ErrorCode.ServiceContractNotFound);
    }

    const schema = JSONSchemaToZod.convert(serviceContract.schema);
    const { success } = schema.safeParse(config);
    return success;
  },

  loadConfigurationByPlatform: async (
    context: PortalContext,
    platformId: string
  ): Promise<ServiceConfiguration | null> => {
    const configuration = await db(context, 'Service_Configuration')
      .whereRaw("config->>'platform_id' = ?", platformId)
      .first()
      .select('*');

    return configuration ?? null;
  },

  updateConfiguration: async (
    context: PortalContext,
    serviceInstanceId: ServiceInstanceId,
    mutator: ServiceConfigurationMutator
  ) => {
    await db(context, 'Service_Configuration')
      .update(mutator)
      .where('service_instance_id', '=', serviceInstanceId);
  },

  createConfiguration: async (
    context: PortalContext,
    serviceInstanceId: string,
    config: Record<string, unknown>
  ) => {
    await db(context, 'Service_Configuration').insert({
      service_instance_id: serviceInstanceId,
      config,
    });
  },
};
