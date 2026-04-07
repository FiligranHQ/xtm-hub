import { toGlobalId } from 'graphql-relay/node/node.js';
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
  PlatformRegistrationConnectivityStatus,
  PlatformRegistrationStatus,
  RefreshPlatformRegistrationConnectivityStatusInput,
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
import { isUserAllowedOnOrganization } from '../../security/auth.helper';
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
import { RequiredPlatformVersions } from '../../utils/required-platform-version';
import { doesVersionSatisfy, isValidVersion } from '../../utils/versioning';
import { loadUserOrganization } from '../common/user-organization.domain';
import { DeploymentRequestDomain } from '../deployment/deployment.domain';
import { loadOrganizationBy } from '../organization-management/organizations/organizations.domain';
import {
  loadUsersByCapabilitiesInOrganization,
  updateUser,
} from '../organization-management/users/users.domain';
import { ServiceDefinitionDomain } from '../services/definition/service-definition.domain';
import {
  loadServiceDefinitionByServiceInstance,
  updateServiceInstance,
} from '../services/service-instance.domain';
import { loadSubscriptionBy } from '../subcription/subscription.domain';
import { telemetryApp } from '../telemetry/telemetry.app';
import { buildRegisterEvent } from '../telemetry/telemetry.helper';
import {
  DomainRegisteredPlatform,
  PlatformConfiguration,
  registrationDomain,
} from './registration.domain';
import { platformIdentifierMappedByServiceDefinitionIdentifier } from './registration.mapping';
import { ServiceConfigurationDomain } from './service-configuration/service-configuration.domain';

export const registrationApp = {
  loadPlatformAssociatedOrganization: async (
    platformId: string
  ): Promise<Organization | null> => {
    const { user } = requestContext.require();
    const serviceConfiguration =
      await ServiceConfigurationDomain.loadConfigurationByPlatform(platformId);
    if (!serviceConfiguration) {
      return null;
    }

    const subscription = await loadSubscriptionBy({
      service_instance_id: serviceConfiguration.service_instance_id,
    });
    if (!subscription) {
      throw new Error(ErrorCode.SubscriptionNotFound);
    }

    const [userOrganization] = await loadUserOrganization({
      organization_id: subscription.organization_id,
      user_id: user.id,
    });

    if (!userOrganization) {
      throw new Error(ErrorCode.UserIsNotInOrganization);
    }

    return loadOrganizationBy({ id: subscription.organization_id });
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
      await ServiceConfigurationDomain.loadConfigurationByPlatformAndToken(
        input
      );
    return {
      status:
        serviceConfiguration?.status === ServiceConfigurationStatus.Active
          ? PlatformRegistrationConnectivityStatus.Active
          : PlatformRegistrationConnectivityStatus.Inactive,
    };
  },

  refreshPlatformRegistrationConnectivityStatus: async (
    input: RefreshPlatformRegistrationConnectivityStatusInput
  ): Promise<{ status: PlatformRegistrationConnectivityStatus }> => {
    if (!isValidVersion(input.platformVersion)) {
      throw new Error(ErrorCode.InvalidPlatformVersion);
    }

    const serviceConfiguration =
      await ServiceConfigurationDomain.loadConfigurationByPlatformAndToken(
        input
      );
    if (!serviceConfiguration) {
      if (!input.platformIdentifier) {
        return { status: PlatformRegistrationConnectivityStatus.Inactive };
      }

      const requiredVersionForNotFoundStatus =
        RequiredPlatformVersions.RefreshConnectivityStatusSendsNotFound[
          input.platformIdentifier
        ];

      const shouldSendNotFoundStatus = doesVersionSatisfy({
        givenVersion: input.platformVersion,
        requiredVersion: requiredVersionForNotFoundStatus,
      });

      return {
        status: shouldSendNotFoundStatus
          ? PlatformRegistrationConnectivityStatus.NotFound
          : PlatformRegistrationConnectivityStatus.Inactive,
      };
    }

    const shouldUpdatePlatformVersion =
      serviceConfiguration.config['version'] !== input.platformVersion;
    if (shouldUpdatePlatformVersion) {
      await ServiceConfigurationDomain.updateConfiguration(
        serviceConfiguration.service_instance_id,
        {
          config: {
            ...(serviceConfiguration.config as object),
            platform_version: input.platformVersion,
          },
        }
      );
    }

    return {
      status:
        serviceConfiguration.status === ServiceConfigurationStatus.Active
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
    const configuration: PlatformConfiguration = {
      registerer_id: user.id,
      platform_id: platform.id,
      platform_url: platform.url,
      platform_title: platform.title,
      platform_contract: platform.contract,
      platform_version: platform.version,
      token,
    };

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
      await ServiceConfigurationDomain.loadConfigurationByPlatform(platform.id);

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

    const users = await loadUsersByCapabilitiesInOrganization(organizationId, [
      OrganizationCapability.AdministrateOrganization,
      OrganizationCapability.ManagePlatformRegistration,
    ]);

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
      const selectedOrga = await loadOrganizationBy({
        id: organizationId as OrganizationId,
      });

      const registerEvent = buildRegisterEvent(
        selectedOrga,
        user.id,
        identifier,
        platform.id,
        platform.contract,
        platform.version,
        platform.url
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
  }: UnregisterPlatformInput) => {
    const activeServiceConfiguration =
      await ServiceConfigurationDomain.loadConfigurationByPlatform(
        platformId,
        ServiceConfigurationStatus.Active
      );
    if (!activeServiceConfiguration) {
      return;
    }

    const subscription = await loadSubscriptionBy({
      service_instance_id: activeServiceConfiguration.service_instance_id,
    });
    if (!subscription) {
      throw new Error(ErrorCode.SubscriptionNotFound);
    }

    const serviceDefinition = await loadServiceDefinitionByServiceInstance(
      activeServiceConfiguration.service_instance_id
    );

    if (!serviceDefinition) {
      throw new Error(ErrorCode.ServiceDefinitionNotFound);
    }

    const platformIdentifier =
      platformIdentifierMappedByServiceDefinitionIdentifier[
        serviceDefinition.identifier
      ];
    if (identifier !== platformIdentifier) {
      throw new Error(ErrorCode.InvalidPlatformIdentifier);
    }
    const { user } = requestContext.require();
    await securityGuard.assertUserIsAllowedOnOrganization(user, {
      organizationId: subscription.organization_id,
      requiredCapability: OrganizationCapability.ManagePlatformRegistration,
    });

    await ServiceConfigurationDomain.updateConfiguration(
      activeServiceConfiguration.service_instance_id,
      { status: ServiceConfigurationStatus.Inactive }
    );

    const users = await loadUsersByCapabilitiesInOrganization(
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
            platformIdentifier,
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
        input.platformId
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
  }: CanUnregisterPlatformInput): Promise<{
    isAllowed: boolean;
    organizationId: OrganizationId;
    isInOrganization: boolean;
  }> => {
    const serviceConfiguration =
      await ServiceConfigurationDomain.loadConfigurationByPlatform(
        platformId,
        ServiceConfigurationStatus.Active
      );
    if (!serviceConfiguration) {
      throw new Error(ErrorCode.PlatformNotRegistered);
    }

    const subscription = await loadSubscriptionBy({
      service_instance_id: serviceConfiguration.service_instance_id,
    });
    if (!subscription) {
      throw new Error(ErrorCode.PlatformNotRegistered);
    }

    const serviceDefinition = await loadServiceDefinitionByServiceInstance(
      subscription.service_instance_id
    );
    if (!serviceDefinition) {
      throw new Error(ErrorCode.ServiceDefinitionNotFound);
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
    await updateUser(userId, { platform_token: token });

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

    const configuration: PlatformConfiguration = {
      registerer_id: deploymentRequest.user_requester_id,
      platform_id: input.platform.id,
      platform_url: input.platform.url,
      platform_title: input.platform.title,
      platform_contract: input.platform.contract,
      platform_version: input.platform.version,
      token: deploymentRequest.platform_token,
    };

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
        const selectedOrga = await loadOrganizationBy({
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
          input.existing_users_count ?? undefined
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
    title: platform.config?.platform_title ?? defaultTitle,
    url: platform.config?.platform_url ?? '',
    contract: platform.config?.platform_contract ?? PlatformContract.Trial,
    identifier:
      platform.identifier ?? ServiceDefinitionIdentifier.OpenctiRegistration,
    version: platform.config?.platform_version ?? '',
    illustration_document_id: platform.illustration_document_id
      ? toGlobalId('Document', platform.illustration_document_id)
      : null,
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
