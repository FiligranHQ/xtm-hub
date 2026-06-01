import { v4 as uuidv4 } from 'uuid';
import {
  AutoRegisterPlatformInput,
  CanUnregisterPlatformInput,
  DeploymentRequestHubStatus,
  IsPlatformRegisteredInput,
  IsPlatformRegisteredResponse,
  OpenCtiPlatformRegistrationStatusInput,
  OrganizationCapability,
  PlatformContract,
  PlatformInput,
  PlatformRegistrationConnectivityStatus,
  PlatformRegistrationStatus,
  RefreshUserPlatformTokenResponse,
  RegisteredPlatform,
  RegisteredPlatformsInput,
  RegisterPlatformInput,
  ServiceConfigurationStatus,
  ServiceDefinitionIdentifier,
  ServiceInstanceCreationStatus,
  UnregisterPlatformInput,
} from '../../__generated__/resolvers-types';
import { withTransaction } from '../../context/database.context';
import { requestContext } from '../../context/request.context';
import DeploymentRequest from '../../model/kanel/public/DeploymentRequest';
import Organization, {
  OrganizationId,
} from '../../model/kanel/public/Organization';
import { ServiceInstanceId } from '../../model/kanel/public/ServiceInstance';
import { UserId } from '../../model/kanel/public/User';
import { securityGuard } from '../../security/guard';
import { sendMail } from '../../server/mail-service';
import { logApp } from '../../utils/app-logger.util';
import {
  BadRequestErrorCode,
  ErrorCode,
  ForbiddenErrorCode,
  NotFoundErrorCode,
} from '../../utils/error/error.code';
import { formatName } from '../../utils/format';
import { isValidVersion } from '../../utils/versioning';
import { DeploymentRequestDomain } from '../deployment/deployment.domain';
import { OrganizationDomain } from '../organization-management/organization/organization.domain';
import { UserDomain } from '../organization-management/user/user-domain/user.domain';
import { UserOrganizationDomain } from '../organization-management/user/user-organization/user-organization.domain';
import { isUserAllowedOnOrganization } from '../security-management/capability/auth.helper';
import { ServiceDefinitionDomain } from '../service/definition/service-definition.domain';
import { updateServiceInstance } from '../service/instance/service-instance.domain';
import { loadSubscriptionBy } from '../subscription/subscription.domain';
import { telemetryApp } from '../telemetry/telemetry.app';
import { buildRegisterEvent } from '../telemetry/telemetry.helper';
import {
  DomainRegisteredPlatform,
  PlatformConfiguration,
  registrationDomain,
} from './registration.domain';
import { isTenantIdRequired } from './registration.helper';
import { ServiceConfigurationDomain } from './service-configuration/service-configuration.domain';

const buildPlatformConfiguration = (
  platform: PlatformInput,
  registererId: string,
  token: string
): PlatformConfiguration => ({
  registerer_id: registererId,
  platform_id: platform.id,
  ...(platform.tenantId ? { tenant_id: platform.tenantId } : {}),
  ...(platform.tenantName ? { tenant_name: platform.tenantName } : {}),
  platform_url: platform.url,
  platform_title: platform.title,
  platform_contract: platform.contract,
  platform_version: platform.version,
  last_connectivity_check: new Date(),
  token,
});

export const registrationApp = {
  loadPlatformAssociatedOrganization: async (
    platformId: string,
    tenantId?: string | null
  ): Promise<Organization | null> => {
    const { user } = requestContext.require();
    const resolvedConfiguration =
      await ServiceConfigurationDomain.loadResolvedConfigurationByPlatform(
        platformId,
        { tenantId }
      );
    if (!resolvedConfiguration) {
      return null;
    }

    if (!tenantId) {
      if (
        isTenantIdRequired(
          resolvedConfiguration.platformIdentifier,
          resolvedConfiguration.config.platform_version
        )
      ) {
        throw new Error(BadRequestErrorCode.TenantIdMandatory);
      }
    }

    const subscription = await loadSubscriptionBy({
      service_instance_id:
        resolvedConfiguration.serviceConfiguration.service_instance_id,
    });
    if (!subscription) {
      throw new Error(ErrorCode.SubscriptionNotFound);
    }

    const [userOrganization] =
      await UserOrganizationDomain.loadUserOrganization({
        organization_id: subscription.organization_id,
        user_id: user.id,
      });

    if (!userOrganization) {
      throw new Error(ErrorCode.UserIsNotInOrganization);
    }

    return OrganizationDomain.loadOrganizationBy({
      id: subscription.organization_id,
    });
  },

  loadRegisteredPlatform: async (
    serviceInstanceId: ServiceInstanceId
  ): Promise<RegisteredPlatform | null> => {
    const [platform] =
      await registrationDomain.loadRegisteredPlatform(serviceInstanceId);

    return platform ? mapDomainRegisteredPlatformToGraphQL(platform) : null;
  },

  loadRegisteredPlatforms: async (
    input: RegisteredPlatformsInput
  ): Promise<RegisteredPlatform[]> => {
    const platforms = await registrationDomain.loadRegisteredPlatforms({
      platformIdentifier: input?.identifier,
      onlyActive: input?.onlyActive ?? false,
      onlyTrial: input?.onlyTrial ?? false,
    });

    return platforms.map(mapDomainRegisteredPlatformToGraphQL);
  },

  /**
   * @deprecated This function is only used by openCTIPlatformRegistrationStatus, which is deprecated.
   * Be careful when using it.
   */
  loadPlatformRegistrationStatus: async (
    input: OpenCtiPlatformRegistrationStatusInput
  ): Promise<{ status: PlatformRegistrationConnectivityStatus }> => {
    const serviceConfiguration =
      await ServiceConfigurationDomain.loadConfigurationByPlatformAndToken({
        platform_id: input.platformId,
        token: input.token,
      });
    return {
      status:
        serviceConfiguration?.status === ServiceConfigurationStatus.Active
          ? PlatformRegistrationConnectivityStatus.Active
          : PlatformRegistrationConnectivityStatus.Inactive,
    };
  },

  registerPlatform: async ({
    organizationId,
    platform,
    identifier,
  }: RegisterPlatformInput): Promise<string> => {
    const { user } = requestContext.require();
    const token = uuidv4();

    if (platform.version && !isValidVersion(platform.version)) {
      throw new Error(BadRequestErrorCode.InvalidPlatformVersion);
    }

    if (
      isTenantIdRequired(identifier, platform.version) &&
      !platform.tenantId
    ) {
      throw new Error(BadRequestErrorCode.TenantIdMandatory);
    }

    const configuration = buildPlatformConfiguration(platform, user.id, token);

    const serviceDefinition =
      await ServiceDefinitionDomain.loadServiceDefinitionByPlatformIdentifier(
        identifier
      );
    if (!serviceDefinition) {
      throw new Error(ErrorCode.ServiceDefinitionNotFound);
    }

    const isConfigurationValid =
      await ServiceConfigurationDomain.isServiceConfigurationValid(
        serviceDefinition.id,
        configuration
      );
    if (!isConfigurationValid) {
      throw new Error(ErrorCode.InvalidServiceConfiguration);
    }

    const serviceConfiguration =
      await ServiceConfigurationDomain.loadConfigurationByPlatform(
        platform.id,
        {
          tenantId: platform.tenantId,
        }
      );

    const existingConfigTenantId = (
      serviceConfiguration?.config as PlatformConfiguration | undefined
    )?.tenant_id;
    if (existingConfigTenantId && !platform.tenantId) {
      throw new Error(BadRequestErrorCode.TenantIdMandatory);
    }

    await withTransaction(async () => {
      if (serviceConfiguration) {
        await registrationDomain.refreshExistingPlatform({
          serviceInstanceId: serviceConfiguration.service_instance_id,
          targetOrganizationId: organizationId as OrganizationId,
          configuration,
        });
      } else {
        await registrationDomain.registerNewPlatform({
          serviceDefinitionId: serviceDefinition.id,
          organizationId: organizationId as OrganizationId,
          configuration,
          platformIdentifier: identifier,
        });
      }
    });

    const users = await UserDomain.loadUsersByCapabilitiesInOrganization(
      organizationId,
      [
        OrganizationCapability.AdministrateOrganization,
        OrganizationCapability.ManagePlatformRegistration,
      ]
    );

    await Promise.all(
      users.map((user) =>
        sendMail({
          to: user.email,
          template: 'platform_registered',
          params: {
            adminName: formatName(user.first_name ?? ''),
            platformIdentifier: identifier,
          },
        })
      )
    );

    try {
      const selectedOrga = await OrganizationDomain.loadOrganizationBy({
        id: organizationId as OrganizationId,
      });

      const registerEvent = buildRegisterEvent(
        selectedOrga,
        user.id,
        identifier,
        platform.id,
        platform.contract,
        platform.version,
        platform.url,
        undefined,
        platform.tenantId ?? undefined
      );
      await telemetryApp.sendTelemetryEvent(registerEvent);
    } catch (error) {
      logApp.error('Unable to send telemetry event for registration', {
        error,
      });
    }

    return token;
  },

  unregisterPlatform: async ({
    platformId,
    identifier,
    tenantId,
  }: UnregisterPlatformInput) => {
    const resolvedConfiguration =
      await ServiceConfigurationDomain.loadResolvedConfigurationByPlatform(
        platformId,
        {
          tenantId,
          status: ServiceConfigurationStatus.Active,
        }
      );
    if (!resolvedConfiguration) {
      return;
    }

    if (resolvedConfiguration.config.tenant_id && !tenantId) {
      throw new Error(BadRequestErrorCode.TenantIdMandatory);
    }

    const subscription = await loadSubscriptionBy({
      service_instance_id:
        resolvedConfiguration.serviceConfiguration.service_instance_id,
    });
    if (!subscription) {
      throw new Error(ErrorCode.SubscriptionNotFound);
    }

    if (identifier !== resolvedConfiguration.platformIdentifier) {
      throw new Error(ErrorCode.InvalidPlatformIdentifier);
    }
    const { user } = requestContext.require();
    await securityGuard.assertUserIsAllowedOnOrganization(user, {
      organizationId: subscription.organization_id,
      requiredCapability: OrganizationCapability.ManagePlatformRegistration,
    });

    await ServiceConfigurationDomain.updateConfiguration(
      resolvedConfiguration.serviceConfiguration.service_instance_id,
      { status: ServiceConfigurationStatus.Inactive }
    );

    const users = await UserDomain.loadUsersByCapabilitiesInOrganization(
      subscription.organization_id,
      [
        OrganizationCapability.AdministrateOrganization,
        OrganizationCapability.ManagePlatformRegistration,
      ]
    );

    await Promise.all(
      users.map((user) =>
        sendMail({
          to: user.email,
          template: 'platform_unregistered',
          params: {
            adminName: formatName(user.first_name ?? ''),
            platformIdentifier: identifier,
          },
        })
      )
    );
  },

  isPlatformRegistered: async (
    input: IsPlatformRegisteredInput
  ): Promise<IsPlatformRegisteredResponse> => {
    const serviceConfiguration =
      await ServiceConfigurationDomain.loadConfigurationByPlatform(
        input.platformId,
        { tenantId: input.tenantId }
      );
    if (!serviceConfiguration) {
      return { status: PlatformRegistrationStatus.NeverRegistered };
    }

    const subscription = await loadSubscriptionBy({
      service_instance_id: serviceConfiguration.service_instance_id,
    });
    if (!subscription) {
      throw new Error(ErrorCode.SubscriptionNotFound);
    }

    const parsedConfig = JSON.parse(
      JSON.stringify(serviceConfiguration.config)
    );
    return {
      status:
        serviceConfiguration.status === ServiceConfigurationStatus.Active
          ? PlatformRegistrationStatus.Registered
          : PlatformRegistrationStatus.Unregistered,
      organization: { id: subscription.organization_id },
      platformTitle: parsedConfig.platform_title,
    };
  },

  canUnregisterPlatform: async ({
    platformId,
    tenantId,
  }: CanUnregisterPlatformInput): Promise<{
    isAllowed: boolean;
    organizationId: OrganizationId | null;
    isInOrganization: boolean;
  }> => {
    const resolvedConfiguration =
      await ServiceConfigurationDomain.loadResolvedConfigurationByPlatform(
        platformId,
        {
          tenantId,
          status: ServiceConfigurationStatus.Active,
        }
      );
    if (!resolvedConfiguration) {
      throw new Error(ErrorCode.PlatformNotRegistered);
    }

    const subscription = await loadSubscriptionBy({
      service_instance_id:
        resolvedConfiguration.serviceConfiguration.service_instance_id,
    });
    if (!subscription) {
      throw new Error(ErrorCode.PlatformNotRegistered);
    }

    const { user } = requestContext.require();
    const { isAllowed, isInOrganization } = await isUserAllowedOnOrganization(
      user,
      {
        organizationId: subscription.organization_id,
        requiredCapability: OrganizationCapability.ManagePlatformRegistration,
      }
    );

    return {
      isAllowed,
      isInOrganization,
      organizationId: subscription.organization_id,
    };
  },

  refreshUserPlatformToken: async (
    userId: UserId
  ): Promise<RefreshUserPlatformTokenResponse> => {
    const token = uuidv4();
    await UserDomain.updateUser(userId, { platform_token: token });

    return { token };
  },

  autoRegisterPlatform: async (
    token: string,
    input: AutoRegisterPlatformInput
  ) => {
    const deploymentRequest =
      await DeploymentRequestDomain.loadDeploymentRequestBy({
        platform_token: token,
      });

    assertValidDeploymentRequest(deploymentRequest, input.platform.id);

    if (
      isTenantIdRequired(
        deploymentRequest.platform_identifier,
        input.platform.version
      ) &&
      !input.platform.tenantId
    ) {
      throw new Error(BadRequestErrorCode.TenantIdMandatory);
    }

    const configuration = buildPlatformConfiguration(
      input.platform,
      deploymentRequest.user_requester_id,
      deploymentRequest.platform_token
    );

    await withTransaction(async () => {
      await Promise.all([
        ServiceConfigurationDomain.upsertConfiguration(
          deploymentRequest.service_instance_id,
          configuration
        ),
        updateServiceInstance(deploymentRequest.service_instance_id, {
          creation_status: ServiceInstanceCreationStatus.Ready,
        }),
      ]);

      try {
        const selectedOrga = await OrganizationDomain.loadOrganizationBy({
          id: deploymentRequest.organization_requester_id,
        });

        const registerEvent = buildRegisterEvent(
          selectedOrga,
          deploymentRequest.user_requester_id,
          deploymentRequest.platform_identifier,
          input.platform.id,
          input.platform.contract,
          input.platform.version,
          input.platform.url,
          input.existing_users_count ?? undefined,
          input.platform.tenantId ?? undefined
        );
        await telemetryApp.sendTelemetryEvent(registerEvent);
      } catch (error) {
        logApp.error('Unable to send telemetry event for registration', {
          error,
        });
      }
    });
  },
};

const mapDomainRegisteredPlatformToGraphQL = (
  platform: DomainRegisteredPlatform
): RegisteredPlatform => {
  const PLATFORM_TRIAL_TITLES: Partial<
    Record<ServiceDefinitionIdentifier, string>
  > = {
    [ServiceDefinitionIdentifier.OpenctiRegistration]:
      'OpenCTI - Free Trial Platform',
    [ServiceDefinitionIdentifier.OpenaevRegistration]:
      'OpenAEV - Free Trial Platform',
  };

  const defaultTitle =
    PLATFORM_TRIAL_TITLES[platform.identifier] ?? 'Free Trial Platform';
  return {
    __typename: 'RegisteredPlatform',
    id: platform.id,
    platform_id: platform.config?.platform_id ?? platform.id,
    last_connectivity_check:
      platform.config?.last_connectivity_check ?? new Date(),
    tenant_id: platform.config?.tenant_id,
    tenant_name: platform.config?.tenant_name,
    title: platform.config?.platform_title ?? defaultTitle,
    url: platform.config?.platform_url ?? '',
    contract: platform.config?.platform_contract ?? PlatformContract.Trial,
    identifier:
      platform.identifier ?? ServiceDefinitionIdentifier.OpenctiRegistration,
    version: platform.config?.platform_version ?? '',
    illustration_document_id: platform.illustration_document_id ?? null,
  };
};

const assertValidDeploymentRequest = (
  deploymentRequest: DeploymentRequest,
  platformId: string
) => {
  if (!deploymentRequest) {
    throw new Error(NotFoundErrorCode.DeploymentRequestNotFound);
  }
  if (
    deploymentRequest.platform_id &&
    deploymentRequest.platform_id !== platformId
  ) {
    throw new Error(BadRequestErrorCode.InvalidPlatformId);
  }
  if (
    ![
      DeploymentRequestHubStatus.Active,
      DeploymentRequestHubStatus.Pending,
      DeploymentRequestHubStatus.Provisioning,
    ].includes(deploymentRequest.hub_status)
  ) {
    throw new Error(ForbiddenErrorCode.NotAllowedByDeploymentStatus);
  }
};
