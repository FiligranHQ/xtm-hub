import { toGlobalId } from 'graphql-relay/node/node.js';
import { v4 as uuidv4 } from 'uuid';
import {
  CanUnregisterPlatformInput,
  IsPlatformRegisteredInput,
  IsPlatformRegisteredResponse,
  OpenCtiPlatformRegistrationStatusInput,
  OrganizationCapability,
  PlatformRegistrationConnectivityStatus,
  PlatformRegistrationStatus,
  RefreshPlatformRegistrationConnectivityStatusInput,
  RefreshUserPlatformTokenResponse,
  RegisteredPlatform,
  RegisteredPlatformsInput,
  RegisterPlatformInput,
  ServiceConfigurationStatus,
  UnregisterPlatformInput,
} from '../../../__generated__/resolvers-types';
import Organization, {
  OrganizationId,
} from '../../../model/kanel/public/Organization';
import { PortalContext } from '../../../model/portal-context';
import { isUserAllowedOnOrganization } from '../../../security/auth.helper';
import { securityGuard } from '../../../security/guard';
import { sendMail } from '../../../server/mail-service';
import { logApp } from '../../../utils/app-logger.util';
import { ErrorCode } from '../../../utils/error/error.code';
import { formatName } from '../../../utils/format';
import { loadUserOrganization } from '../../common/user-organization.domain';
import { loadOrganizationBy } from '../../organizations/organizations.domain';
import { loadSubscriptionBy } from '../../subcription/subscription.domain';
import { telemetryApp } from '../../telemetry/telemetry.app';
import { buildRegisterEvent } from '../../telemetry/telemetry.helper';
import {
  loadUsersByCapabilitiesInOrganization,
  updateUser,
} from '../../users/users.domain';
import { serviceContractDomain } from '../contract/domain';
import { serviceDefinitionDomain } from '../definition/service-definition.domain';
import { loadServiceDefinitionByServiceInstance } from '../service-instance.domain';
import {
  PlatformConfiguration,
  registrationDomain,
} from './registration.domain';
import {
  platformIdentifierMappedByServiceDefinitionIdentifier,
  registeredMailTemplateMappedByPlatformIdentifier,
  unregisteredMailTemplateMappedByPlatformIdentifier,
} from './registration.mapping';

export const registrationApp = {
  loadPlatformAssociatedOrganization: async (
    context: PortalContext,
    platformId: string
  ): Promise<Organization | null> => {
    const serviceConfiguration =
      await serviceContractDomain.loadConfigurationByPlatform(
        context,
        platformId
      );
    if (!serviceConfiguration) {
      return null;
    }

    const subscription = await loadSubscriptionBy({
      service_instance_id: serviceConfiguration.service_instance_id,
    });
    if (!subscription) {
      throw new Error(ErrorCode.SubscriptionNotFound);
    }

    const userOrganization = await loadUserOrganization({
      organization_id: subscription.organization_id,
      user_id: context.user.id,
    });

    if (!userOrganization) {
      throw new Error(ErrorCode.UserIsNotInOrganization);
    }

    return loadOrganizationBy({ id: subscription.organization_id });
  },

  loadRegisteredPlatforms: async (
    context: PortalContext,
    input: RegisteredPlatformsInput
  ): Promise<RegisteredPlatform[]> => {
    const platforms = await registrationDomain.loadRegisteredPlatforms(
      context,
      input?.identifier
    );

    return platforms.map((platform) => ({
      __typename: 'RegisteredPlatform',
      id: platform.id,
      platform_id: platform.config.platform_id,
      title: platform.config.platform_title,
      url: platform.config.platform_url,
      contract: platform.config.platform_contract,
      identifier: platform.identifier,
      version: platform.config.platform_version,
      illustration_document_id: platform.illustration_document_id
        ? toGlobalId('Document', platform.illustration_document_id)
        : null,
    }));
  },

  /**
   * @deprecated This function is only used by openCTIPlatformRegistrationStatus, which is deprecated.
   * Be careful when using it.
   */
  loadPlatformRegistrationStatus: async (
    context: PortalContext,
    input: OpenCtiPlatformRegistrationStatusInput
  ): Promise<{ status: PlatformRegistrationConnectivityStatus }> => {
    const activeServiceConfiguration =
      await serviceContractDomain.loadActiveConfigurationByPlatformAndToken(
        context,
        input
      );
    return {
      status: activeServiceConfiguration
        ? PlatformRegistrationConnectivityStatus.Active
        : PlatformRegistrationConnectivityStatus.Inactive,
    };
  },

  refreshPlatformRegistrationConnectivityStatus: async (
    context: PortalContext,
    input: RefreshPlatformRegistrationConnectivityStatusInput
  ): Promise<{ status: PlatformRegistrationConnectivityStatus }> => {
    const activeServiceConfiguration =
      await serviceContractDomain.loadActiveConfigurationByPlatformAndToken(
        context,
        input
      );
    if (
      activeServiceConfiguration &&
      activeServiceConfiguration.config['version'] !== input.platformVersion
    ) {
      await serviceContractDomain.updateConfiguration(
        context,
        activeServiceConfiguration.service_instance_id,
        {
          config: {
            ...(activeServiceConfiguration.config as object),
            platform_version: input.platformVersion,
          },
        }
      );
    }
    return {
      status: activeServiceConfiguration
        ? PlatformRegistrationConnectivityStatus.Active
        : PlatformRegistrationConnectivityStatus.Inactive,
    };
  },

  registerPlatform: async (
    context: PortalContext,
    { organizationId, platform, identifier }: RegisterPlatformInput
  ): Promise<string> => {
    const token = uuidv4();
    const configuration: PlatformConfiguration = {
      registerer_id: context.user.id,
      platform_id: platform.id,
      platform_url: platform.url,
      platform_title: platform.title,
      platform_contract: platform.contract,
      platform_version: platform.version,
      token,
    };

    const serviceDefinition =
      await serviceDefinitionDomain.loadServiceDefinitionByPlatformIdentifier(
        identifier
      );
    if (!serviceDefinition) {
      throw new Error(ErrorCode.ServiceDefinitionNotFound);
    }

    const isConfigurationValid =
      await serviceContractDomain.isServiceConfigurationValid(
        context,
        serviceDefinition.id,
        configuration
      );
    if (!isConfigurationValid) {
      throw new Error(ErrorCode.InvalidServiceConfiguration);
    }

    const serviceConfiguration =
      await serviceContractDomain.loadConfigurationByPlatform(
        context,
        platform.id
      );

    if (serviceConfiguration) {
      await registrationDomain.refreshExistingPlatform(context, {
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

    const users = await loadUsersByCapabilitiesInOrganization(organizationId, [
      OrganizationCapability.AdministrateOrganization,
      OrganizationCapability.ManagePlatformRegistration,
    ]);

    const mailTemplate =
      registeredMailTemplateMappedByPlatformIdentifier[identifier];
    await Promise.all(
      users.map((user) =>
        sendMail({
          to: user.email,
          template: mailTemplate,
          params: {
            adminName: formatName(user.first_name ?? ''),
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
        context.user.id,
        identifier,
        platform.id,
        platform.contract,
        platform.version
      );
      telemetryApp.sendTelemetryEvent(registerEvent);
    } catch (error) {
      logApp.error('Unable to send telemetry event for registration', {
        error,
      });
    }

    return token;
  },

  unregisterPlatform: async (
    context: PortalContext,
    { platformId, identifier }: UnregisterPlatformInput
  ) => {
    const activeServiceConfiguration =
      await serviceContractDomain.loadConfigurationByPlatform(
        context,
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
      context,
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

    await securityGuard.assertUserIsAllowedOnOrganization(context, {
      organizationId: subscription.organization_id,
      requiredCapability: OrganizationCapability.ManagePlatformRegistration,
    });

    await serviceContractDomain.updateConfiguration(
      context,
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

    const template =
      unregisteredMailTemplateMappedByPlatformIdentifier[platformIdentifier];

    await Promise.all(
      users.map((user) =>
        sendMail({
          to: user.email,
          template,
          params: {
            adminName: formatName(user.first_name ?? ''),
          },
        })
      )
    );
  },

  isPlatformRegistered: async (
    context: PortalContext,
    input: IsPlatformRegisteredInput
  ): Promise<IsPlatformRegisteredResponse> => {
    const serviceConfiguration =
      await serviceContractDomain.loadConfigurationByPlatform(
        context,
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

  canUnregisterPlatform: async (
    context: PortalContext,
    { platformId }: CanUnregisterPlatformInput
  ): Promise<{
    isAllowed: boolean;
    organizationId: OrganizationId;
    isInOrganization: boolean;
  }> => {
    const serviceConfiguration =
      await serviceContractDomain.loadConfigurationByPlatform(
        context,
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
      context,
      subscription.service_instance_id
    );
    if (!serviceDefinition) {
      throw new Error(ErrorCode.ServiceDefinitionNotFound);
    }

    const { isAllowed, isInOrganization } = await isUserAllowedOnOrganization(
      context,
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
    context: PortalContext
  ): Promise<RefreshUserPlatformTokenResponse> => {
    const token = uuidv4();

    await updateUser(context.user.id, { platform_token: token });

    return { token };
  },
};
