import z from 'zod';
import { db, dbRaw } from '../../../../knexfile';
import {
  PlatformIdentifier,
  ServiceConfigurationStatus,
} from '../../../__generated__/resolvers-types';
import ServiceConfiguration, {
  ServiceConfigurationMutator,
} from '../../../model/kanel/public/ServiceConfiguration';
import ServiceContract, {
  ServiceContractMutator,
} from '../../../model/kanel/public/ServiceContract';
import ServiceDefinition, {
  ServiceDefinitionId,
} from '../../../model/kanel/public/ServiceDefinition';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import { logApp } from '../../../utils/app-logger.util';
import { ErrorCode } from '../../../utils/error/error.code';
import { formatRawObject } from '../../../utils/query-raw.util';
import type { PlatformConfiguration } from '../registration.domain';
import { platformIdentifierMappedByServiceDefinitionIdentifier } from '../registration.mapping';

const loadServiceContractBy = async (
  field: ServiceContractMutator
): Promise<ServiceContract> => {
  return db('Service_Contract').where(field).select('*').first();
};

export type FullPlatformConfiguration = {
  serviceConfiguration: ServiceConfiguration;
  serviceDefinition: ServiceDefinition;
  platformIdentifier: PlatformIdentifier;
  config: PlatformConfiguration;
};

type ServiceConfigurationWithDefinition = ServiceConfiguration & {
  service_definition: (Partial<ServiceDefinition> & { id?: string }) | null;
};

const resolvePlatformFromJoinedRow = (
  row: ServiceConfigurationWithDefinition
): FullPlatformConfiguration => {
  const { service_definition, ...serviceConfiguration } = row;
  if (!service_definition?.id) {
    throw new Error(ErrorCode.ServiceDefinitionNotFound);
  }
  const serviceDefinition = service_definition as ServiceDefinition;
  const platformIdentifier =
    platformIdentifierMappedByServiceDefinitionIdentifier[
      serviceDefinition.identifier
    ];
  if (!platformIdentifier) {
    throw new Error(ErrorCode.InvalidPlatformIdentifier);
  }
  return {
    serviceConfiguration,
    serviceDefinition,
    platformIdentifier,
    config: serviceConfiguration.config as PlatformConfiguration,
  };
};

const buildJoinedConfigurationQuery = () =>
  db('Service_Configuration')
    .leftJoin(
      'ServiceInstance',
      'ServiceInstance.id',
      '=',
      'Service_Configuration.service_instance_id'
    )
    .leftJoin(
      'ServiceDefinition',
      'ServiceDefinition.id',
      '=',
      'ServiceInstance.service_definition_id'
    )
    .select([
      'Service_Configuration.*',
      dbRaw(
        formatRawObject({
          columnName: 'ServiceDefinition',
          typename: 'ServiceDefinition',
          as: 'service_definition',
        })
      ),
    ]);

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
    const serializedConfig = Object.fromEntries(
      Object.entries(config).map(([key, value]) => [
        key,
        value instanceof Date ? value.toISOString() : value,
      ])
    );
    const { success, error } = schema.safeParse(serializedConfig);
    if (!success) {
      logApp.error('Invalid service configuration', { error });
    }
    return success;
  },

  loadConfigurationByPlatformAndToken: async ({
    platform_id,
    token,
    tenant_id,
    withoutTenantId,
  }: {
    platform_id: string;
    token: string;
    tenant_id?: string;
    withoutTenantId?: boolean;
  }): Promise<ServiceConfiguration | undefined> => {
    const qb = db('Service_Configuration')
      .whereRaw("config->>'platform_id' = ?", platform_id)
      .whereRaw("config->>'token' = ?", token);

    if (tenant_id) {
      qb.whereRaw("config->>'tenant_id' = ?", tenant_id);
    } else if (withoutTenantId) {
      qb.whereRaw("config->>'tenant_id' IS NULL");
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

  loadResolvedConfigurationByPlatform: async (
    platformId: string,
    options?: { tenantId?: string | null } & ServiceConfigurationMutator
  ): Promise<FullPlatformConfiguration | undefined> => {
    const { tenantId, ...filter } = options ?? {};

    const prefixedFilter = Object.fromEntries(
      Object.entries(filter).map(([key, value]) => [
        `Service_Configuration.${key}`,
        value,
      ])
    );

    const qb = buildJoinedConfigurationQuery()
      .whereRaw(
        `"Service_Configuration".config->>'platform_id' = ?`,
        platformId
      )
      .where(prefixedFilter);

    if (tenantId) {
      qb.whereRaw(`"Service_Configuration".config->>'tenant_id' = ?`, tenantId);
    }

    const row = (await qb.first()) as
      | ServiceConfigurationWithDefinition
      | undefined;
    return row ? resolvePlatformFromJoinedRow(row) : undefined;
  },

  loadResolvedConfigurationByPlatformAndToken: async ({
    platform_id,
    token,
    tenant_id,
    withoutTenantId,
  }: {
    platform_id: string;
    token: string;
    tenant_id?: string;
    withoutTenantId?: boolean;
  }): Promise<FullPlatformConfiguration | undefined> => {
    const qb = buildJoinedConfigurationQuery()
      .whereRaw(
        `"Service_Configuration".config->>'platform_id' = ?`,
        platform_id
      )
      .whereRaw(`"Service_Configuration".config->>'token' = ?`, token);

    if (tenant_id) {
      qb.whereRaw(
        `"Service_Configuration".config->>'tenant_id' = ?`,
        tenant_id
      );
    } else if (withoutTenantId) {
      qb.whereRaw(`"Service_Configuration".config->>'tenant_id' IS NULL`);
    }

    const row = (await qb.first()) as
      | ServiceConfigurationWithDefinition
      | undefined;
    return row ? resolvePlatformFromJoinedRow(row) : undefined;
  },

  loadActiveConfigurationsByPlatformExcludingTenants: async (
    platformId: string,
    excludedTenantIds: string[]
  ): Promise<ServiceConfiguration[]> => {
    const qb = db('Service_Configuration')
      .whereRaw("config->>'platform_id' = ?", platformId)
      .where('status', ServiceConfigurationStatus.Active)
      .whereRaw("config->>'tenant_id' IS NOT NULL")
      .select('*');

    if (excludedTenantIds.length > 0) {
      const placeholders = excludedTenantIds.map(() => '?').join(', ');
      qb.whereRaw(
        `config->>'tenant_id' NOT IN (${placeholders})`,
        excludedTenantIds
      );
    }

    return qb;
  },
};
