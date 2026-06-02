import {
  PlatformIdentifier,
  PlatformRegistrationConnectivityStatus,
  RefreshPlatformRegistrationConnectivityStatusAllTenantsInput,
  RefreshPlatformRegistrationConnectivityStatusInput,
  RefreshPlatformRegistrationConnectivityStatusSingleTenantInput,
  ServiceConfigurationStatus,
  TenantStatus,
} from '../../__generated__/resolvers-types';
import ServiceConfiguration from '../../model/kanel/public/ServiceConfiguration';
import { logApp } from '../../utils/app-logger.util';
import { BadRequestErrorCode, ErrorCode } from '../../utils/error/error.code';
import { RequiredPlatformVersions } from '../../utils/required-platform-version';
import { doesVersionSatisfy, isValidVersion } from '../../utils/versioning';
import { PlatformConfiguration } from './registration.domain';
import { isTenantIdRequired } from './registration.helper';
import { ServiceConfigurationDomain } from './service-configuration/service-configuration.domain';

const handleTenantUpgrade = async ({
  platform_id,
  token,
  tenant_id,
  tenant_name,
  platform_identifier,
}: {
  platform_id: string;
  token: string;
  tenant_id: string;
  tenant_name: string;
  platform_identifier: PlatformIdentifier;
}): Promise<ServiceConfiguration | null> => {
  const configWithoutTenant =
    await ServiceConfigurationDomain.loadConfigurationByPlatformAndToken({
      platform_id,
      token,
      withoutTenantId: true,
    });

  const existingConfig = configWithoutTenant?.config as
    | PlatformConfiguration
    | undefined;

  if (
    configWithoutTenant &&
    !isTenantIdRequired(platform_identifier, existingConfig?.platform_version)
  ) {
    const updatedConfig = { ...existingConfig, tenant_id, tenant_name };
    await ServiceConfigurationDomain.updateConfiguration(
      configWithoutTenant.service_instance_id,
      { config: updatedConfig }
    );
    return { ...configWithoutTenant, config: updatedConfig };
  }

  return null;
};

const resolveStatusWhenNoConfiguration = ({
  platform_identifier,
  platform_version,
}: {
  platform_identifier?: PlatformIdentifier;
  platform_version: string;
}): { status: PlatformRegistrationConnectivityStatus } => {
  if (!platform_identifier) {
    return { status: PlatformRegistrationConnectivityStatus.Inactive };
  }

  const requiredVersionForNotFoundStatus =
    RequiredPlatformVersions.RefreshConnectivityStatusSendsNotFound[
      platform_identifier
    ];

  const shouldSendNotFoundStatus = doesVersionSatisfy({
    givenVersion: platform_version,
    requiredVersion: requiredVersionForNotFoundStatus,
  });

  return {
    status: shouldSendNotFoundStatus
      ? PlatformRegistrationConnectivityStatus.NotFound
      : PlatformRegistrationConnectivityStatus.Inactive,
  };
};

const saveConfig = async ({
  serviceConfiguration,
  platform_version,
  url,
  tenant_name,
}: {
  serviceConfiguration: ServiceConfiguration;
  platform_version: string;
  url?: string;
  tenant_name?: string;
}): Promise<void> => {
  const existingConfig = serviceConfiguration.config;
  const hasConfigChanged =
    existingConfig['platform_version'] !== platform_version ||
    (url && existingConfig['url'] !== url) ||
    (tenant_name && existingConfig['tenant_name'] !== tenant_name);

  if (hasConfigChanged) {
    await ServiceConfigurationDomain.updateConfiguration(
      serviceConfiguration.service_instance_id,
      {
        config: {
          ...(existingConfig as object),
          last_connectivity_check: new Date(),
          platform_version,
          ...(url ? { url } : {}),
          ...(tenant_name ? { tenant_name } : {}),
        },
      }
    );
    return;
  }
  await ServiceConfigurationDomain.updateConfiguration(
    serviceConfiguration.service_instance_id,
    {
      config: {
        ...(existingConfig as object),
        last_connectivity_check: new Date(),
      },
    }
  );
};

const refreshConnectivityStatus = async ({
  platform_id,
  token,
  platform_version,
  url,
  tenant_id,
  tenant_name,
  platform_identifier,
}: {
  platform_id: string;
  token: string;
  platform_version: string;
  url?: string;
  tenant_id?: string;
  tenant_name?: string;
  platform_identifier?: PlatformIdentifier;
}): Promise<{ status: PlatformRegistrationConnectivityStatus }> => {
  if (!isValidVersion(platform_version)) {
    throw new Error(ErrorCode.InvalidPlatformVersion);
  }

  if (
    !tenant_id &&
    platform_identifier &&
    isTenantIdRequired(platform_identifier, platform_version)
  ) {
    throw new Error(BadRequestErrorCode.TenantIdMandatory);
  }

  let serviceConfiguration =
    await ServiceConfigurationDomain.loadConfigurationByPlatformAndToken({
      platform_id,
      token,
      tenant_id,
    });

  const canAttemptTenantUpgrade =
    !serviceConfiguration && tenant_id && tenant_name && platform_identifier;
  if (canAttemptTenantUpgrade) {
    serviceConfiguration = await handleTenantUpgrade({
      platform_id,
      token,
      tenant_id,
      tenant_name,
      platform_identifier,
    });
  }

  if (!serviceConfiguration) {
    return resolveStatusWhenNoConfiguration({
      platform_identifier,
      platform_version,
    });
  }

  await saveConfig({
    serviceConfiguration,
    platform_version,
    url,
    tenant_name,
  });

  return {
    status:
      serviceConfiguration.status === ServiceConfigurationStatus.Active
        ? PlatformRegistrationConnectivityStatus.Active
        : PlatformRegistrationConnectivityStatus.Inactive,
  };
};

export const registrationConnectivityApp = {
  refreshPlatformRegistrationConnectivityStatus: async (
    input: RefreshPlatformRegistrationConnectivityStatusInput
  ): Promise<{ status: PlatformRegistrationConnectivityStatus }> => {
    return refreshConnectivityStatus({
      platform_identifier: input.platformIdentifier,
      platform_version: input.platformVersion,
      platform_id: input.platformId,
      token: input.token,
    });
  },

  refreshPlatformRegistrationConnectivityStatusSingleTenant: async (
    input: RefreshPlatformRegistrationConnectivityStatusSingleTenantInput
  ): Promise<{ status: PlatformRegistrationConnectivityStatus }> => {
    return refreshConnectivityStatus({
      platform_identifier: input.platformIdentifier,
      platform_version: input.platformVersion,
      platform_id: input.platformId,
      token: input.token,
      url: input.url,
      tenant_id: input.tenantId,
      tenant_name: input.tenantName,
    });
  },

  refreshPlatformRegistrationConnectivityStatusAllTenants: async (
    input: RefreshPlatformRegistrationConnectivityStatusAllTenantsInput
  ): Promise<{ statuses: TenantStatus[] }> => {
    const results = await Promise.allSettled(
      input.tenants.map((tenant) =>
        refreshConnectivityStatus({
          platform_identifier: input.platformIdentifier,
          platform_version: input.platformVersion,
          platform_id: input.platformId,
          token: tenant.token,
          url: tenant.url,
          tenant_id: tenant.tenantId,
          tenant_name: tenant.tenantName,
        }).then(({ status }) => ({ tenantId: tenant.tenantId, status }))
      )
    );
    const statuses = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      }
      logApp.error(
        `Failed to refresh connectivity status for tenant ${input.tenants[index].tenantId}`,
        { error: result.reason }
      );
      return {
        tenantId: input.tenants[index].tenantId,
        status: PlatformRegistrationConnectivityStatus.Inactive,
      };
    });

    const knownTenantIds = input.tenants.map((t) => t.tenantId);
    const staleConfigurations =
      await ServiceConfigurationDomain.loadActiveConfigurationsByPlatformExcludingTenants(
        input.platformId,
        knownTenantIds
      );

    await Promise.all(
      staleConfigurations.map((config) =>
        ServiceConfigurationDomain.updateConfiguration(
          config.service_instance_id,
          { status: ServiceConfigurationStatus.Inactive }
        ).catch((error) => {
          logApp.error(
            `Failed to deactivate stale configuration for service instance ${config.service_instance_id}`,
            { error }
          );
        })
      )
    );

    return { statuses };
  },
};
