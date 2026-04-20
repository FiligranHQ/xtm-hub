import z from 'zod';
import { db } from '../../../../knexfile';
import ServiceConfiguration, {
  ServiceConfigurationMutator,
} from '../../../model/kanel/public/ServiceConfiguration';
import ServiceContract, {
  ServiceContractMutator,
} from '../../../model/kanel/public/ServiceContract';
import { ServiceDefinitionId } from '../../../model/kanel/public/ServiceDefinition';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import { logApp } from '../../../utils/app-logger.util';
import { ErrorCode } from '../../../utils/error/error.code';

const loadServiceContractBy = async (
  field: ServiceContractMutator
): Promise<ServiceContract> => {
  return db('Service_Contract').where(field).select('*').first();
};

export const ServiceConfigurationDomain = {
  isServiceConfigurationValid: async (
    serviceDefinitionId: ServiceDefinitionId,
    config: Record<string, unknown>
  ): Promise<boolean> => {
    const serviceContract = await loadServiceContractBy({
      service_definition_id: serviceDefinitionId,
    });
    if (!serviceContract) {
      throw new Error(ErrorCode.ServiceContractNotFound);
    }

    const schema = z.fromJSONSchema(
      serviceContract.schema as Parameters<typeof z.fromJSONSchema>[0]
    );
    const { success, error } = schema.safeParse(config);
    if (!success) {
      logApp.error('Invalid service configuration', { error });
    }
    return success;
  },

  loadConfigurationByPlatformAndToken: async ({
    platform_id,
    token,
    tenant_id,
  }: {
    platform_id: string;
    token: string;
    tenant_id?: string;
  }): Promise<ServiceConfiguration | undefined> => {
    const qb = db('Service_Configuration')
      .whereRaw("config->>'platform_id' = ?", platform_id)
      .whereRaw("config->>'token' = ?", token);

    if (tenant_id) {
      qb.whereRaw("config->>'tenant_id' = ?", tenant_id);
    }

    return qb.first();
  },

  loadConfigurationByPlatform: async (
    platformId: string,
    options?: { tenantId?: string | null } & ServiceConfigurationMutator
  ): Promise<ServiceConfiguration | undefined> => {
    const { tenantId, ...filter } = options ?? {};

    const qb = db('Service_Configuration')
      .whereRaw("config->>'platform_id' = ?", platformId)
      .where(filter)
      .first()
      .select('*');

    if (tenantId) {
      qb.whereRaw("config->>'tenant_id' = ?", options?.tenantId);
    }

    return qb;
  },

  updateConfiguration: async (
    serviceInstanceId: ServiceInstanceId,
    mutator: ServiceConfigurationMutator
  ) => {
    await db('Service_Configuration')
      .update(mutator)
      .where('service_instance_id', '=', serviceInstanceId);
  },

  createConfiguration: async (
    serviceInstanceId: string,
    config: Record<string, unknown>
  ) => {
    await db('Service_Configuration').insert({
      service_instance_id: serviceInstanceId,
      config,
    });
  },

  upsertConfiguration: async (
    serviceInstanceId: string,
    config: Record<string, unknown>
  ) => {
    await db('Service_Configuration')
      .insert({
        service_instance_id: serviceInstanceId,
        config,
      })
      .onConflict('service_instance_id')
      .merge();
  },

  deleteConfigurationBy: async (conditions: ServiceConfigurationMutator) => {
    await db('Service_Configuration').where(conditions).delete();
  },
};
