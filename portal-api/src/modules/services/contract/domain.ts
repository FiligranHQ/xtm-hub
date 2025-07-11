import { JSONSchemaToZod } from '@dmitryrechkin/json-schema-to-zod';
import { db } from '../../../../knexfile';
import ServiceConfiguration from '../../../model/kanel/public/ServiceConfiguration';
import ServiceContract from '../../../model/kanel/public/ServiceContract';
import { PortalContext } from '../../../model/portal-context';
import { ErrorCode } from '../../common/error-code';

const loadServiceContract = async (
  context: PortalContext,
  serviceDefinitionId: string
): Promise<ServiceContract> => {
  return db(context, 'Service_Contract')
    .where('service_definition_id', '=', serviceDefinitionId)
    .select('*')
    .first();
};

export const serviceContractDomain = {
  isServiceConfigurationValid: async (
    context: PortalContext,
    serviceDefinitionId: string,
    config: Record<string, unknown>
  ): Promise<boolean> => {
    const serviceContract = await loadServiceContract(
      context,
      serviceDefinitionId
    );
    if (!serviceContract) {
      throw new Error(ErrorCode.ServiceContractNotFound);
    }

    const schema = JSONSchemaToZod.convert(serviceContract.schema);
    const { success } = schema.safeParse(config);
    return success;
  },

  findConfiguration: async (
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
    serviceInstanceId: string,
    config: Record<string, unknown>
  ) => {
    await db(context, 'Service_Configuration')
      .update({ config })
      .where('service_instance_id', '=', serviceInstanceId);
  },

  insertConfiguration: async (
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
