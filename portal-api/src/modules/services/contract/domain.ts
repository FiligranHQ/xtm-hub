import { JSONSchemaToZod } from '@dmitryrechkin/json-schema-to-zod';
import { db } from '../../../../knexfile';
import ServiceContract from '../../../model/kanel/public/ServiceContract';
import { PortalContext } from '../../../model/portal-context';

export const serviceContractDomain = {
  isServiceConfigurationValid: async (
    context: PortalContext,
    serviceDefinitionId: string,
    config: Record<string, unknown>
  ): Promise<boolean> => {
    const serviceContract = await serviceContractDomain.loadServiceContract(
      context,
      serviceDefinitionId
    );
    if (!serviceContract) {
      throw new Error('Service contract not found');
    }

    const schema = JSONSchemaToZod.convert(serviceContract.schema);
    const { success } = schema.safeParse(config);
    return success;
  },
  loadServiceContract: async (
    context: PortalContext,
    serviceDefinitionId: string
  ): Promise<ServiceContract> => {
    return db(context, 'Service_Contract').where(
      'service_definition_id',
      '=',
      serviceDefinitionId
    );
  },
  saveConfiguration: async (
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
