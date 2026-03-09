import z from 'zod';
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
import { logApp } from '../../../utils/app-logger.util';
import { ErrorCode } from '../../../utils/error/error.code';

const loadServiceContractBy = async (
  field: ServiceContractMutator
): Promise<ServiceContract> => {
  return db('Service_Contract').where(field).select('*').first();
};

export const ServiceContractDomain = {
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
    platformId,
    token,
  }: {
    platformId: string;
    token: string;
  }): Promise<ServiceConfiguration | undefined> => {
    return db('Service_Configuration')
      .whereRaw("config->>'platform_id' = ?", platformId)
      .whereRaw("config->>'token' = ?", token)
      .first();
  },

  loadConfigurationByPlatform: async (
    platformId: string,
    status?: ServiceConfigurationStatus
  ): Promise<ServiceConfiguration | null> => {
    const qb = db('Service_Configuration')
      .whereRaw("config->>'platform_id' = ?", platformId)
      .first()
      .select('*');

    if (status) {
      qb.where({ status });
    }

    return (await qb) ?? null;
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
