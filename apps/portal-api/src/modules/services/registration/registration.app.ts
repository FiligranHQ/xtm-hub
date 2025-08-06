import { v4 as uuidv4 } from 'uuid';
import {
  CanUnregisterOctiPlatformInput,
  IsOctiPlatformRegisteredInput,
  IsOctiPlatformRegisteredResponse,
  OctiPlatform,
  OctiPlatformRegistrationStatus,
  OctiPlatformRegistrationStatusInput,
  OctiPlatformRegistrationStatusResponse,
  OrganizationCapability,
  PlatformRegistrationStatus,
  RegisterOctiPlatformInput,
  ServiceConfigurationStatus,
  ServiceDefinitionIdentifier,
} from '../../../__generated__/resolvers-types';
import { OrganizationId } from '../../../model/kanel/public/Organization';
import { PortalContext } from '../../../model/portal-context';
import { isUserAllowedOnOrganization } from '../../../security/auth.helper';
import { sendMail } from '../../../server/mail-service';
import { ErrorCode } from '../../common/error-code';
import { loadSubscriptionBy } from '../../subcription/subscription.domain';
import { loadOrganizationAdministrators } from '../../users/users.domain';
import { serviceContractDomain } from '../contract/domain';
import { serviceDefinitionDomain } from '../definition/domain';
import {
  OCTIPlatformConfiguration,
  registrationDomain,
} from './registration.domain';

export const registrationApp = {
  loadOCTIPlatforms: async (
    context: PortalContext
  ): Promise<OctiPlatform[]> => {
    const platforms = await registrationDomain.loadOCTIPlatforms(context);
    return platforms.map((platform) => ({
      __typename: 'OCTIPlatform',
      id: platform.config.platform_id,
      platform_id: platform.config.platform_id,
      title: platform.config.platform_title,
      url: platform.config.platform_url,
      contract: platform.config.platform_contract,
    }));
  },

  loadOCTIPlatformRegistrationStatus: async (
    context: PortalContext,
    input: OctiPlatformRegistrationStatusInput
  ): Promise<OctiPlatformRegistrationStatusResponse> => {
    const activeServiceConfiguration =
      await serviceContractDomain.loadActiveConfigurationByPlatformAndToken(
        context,
        input
      );
    return {
      status: activeServiceConfiguration
        ? OctiPlatformRegistrationStatus.Active
        : OctiPlatformRegistrationStatus.Inactive,
    };
  },

  registerOCTIPlatform: async (
    context: PortalContext,
    { organizationId, platform }: RegisterOctiPlatformInput
  ): Promise<string> => {
    const token = uuidv4();
    const configuration: OCTIPlatformConfiguration = {
      registerer_id: context.user.id,
      platform_id: platform.id,
      platform_url: platform.url,
      platform_title: platform.title,
      platform_contract: platform.contract,
      token: token,
    };

    const serviceDefinition =
      await serviceDefinitionDomain.loadServiceDefinitionBy(context, {
        identifier: ServiceDefinitionIdentifier.OctiRegistration,
      });
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

    const { isAllowed, isInOrganization } = await isUserAllowedOnOrganization(
      context,
      {
        organizationId,
        requiredCapability: OrganizationCapability.ManageOpenctiRegistration,
      }
    );

    if (!isAllowed) {
      const errorCode = isInOrganization
        ? ErrorCode.MissingCapabilityOnOrganization
        : ErrorCode.UserIsNotInOrganization;
      throw new Error(errorCode);
    }

    const serviceConfiguration =
      await serviceContractDomain.loadConfigurationByPlatform(
        context,
        platform.id
      );

    if (serviceConfiguration) {
      await registrationDomain.refreshExistingPlatform(context, {
        serviceInstanceId: serviceConfiguration.service_instance_id,
        targetOrganizationId: organizationId,
        configuration,
      });
    } else {
      await registrationDomain.registerNewPlatform(context, {
        serviceDefinitionId: serviceDefinition.id,
        organizationId: organizationId as OrganizationId,
        configuration,
      });
    }

    const users = await loadOrganizationAdministrators(context, organizationId);

    await Promise.all(
      users.map((user) =>
        sendMail({
          to: user.email,
          template: 'opencti_platform_registered',
          params: {
            adminName: `${user.first_name ?? ''}`,
          },
        })
      )
    );

    return token;
  },

  unregisterOCTIPlatform: async (
    context: PortalContext,
    { platformId }: CanUnregisterOctiPlatformInput
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

    const subscription = await loadSubscriptionBy(context, {
      service_instance_id: activeServiceConfiguration.service_instance_id,
    });
    if (!subscription) {
      throw new Error(ErrorCode.SubscriptionNotFound);
    }

    const { isAllowed, isInOrganization } = await isUserAllowedOnOrganization(
      context,
      {
        organizationId: subscription.organization_id,
        requiredCapability: OrganizationCapability.ManageOpenctiRegistration,
      }
    );

    if (!isAllowed) {
      if (isInOrganization) {
        throw new Error(ErrorCode.MissingCapabilityOnOrganization);
      } else {
        throw new Error(ErrorCode.UserIsNotInOrganization);
      }
    }

    await serviceContractDomain.updateConfiguration(
      context,
      activeServiceConfiguration.service_instance_id,
      { status: ServiceConfigurationStatus.Inactive }
    );
  },

  isOCTIPlatformRegistered: async (
    context: PortalContext,
    input: IsOctiPlatformRegisteredInput
  ): Promise<IsOctiPlatformRegisteredResponse> => {
    const serviceConfiguration =
      await serviceContractDomain.loadConfigurationByPlatform(
        context,
        input.platformId
      );
    if (!serviceConfiguration) {
      return { status: PlatformRegistrationStatus.NeverRegistered };
    }

    const subscription = await loadSubscriptionBy(context, {
      service_instance_id: serviceConfiguration.service_instance_id,
    });
    if (!subscription) {
      throw new Error(ErrorCode.SubscriptionNotFound);
    }

    return {
      status:
        serviceConfiguration.status === ServiceConfigurationStatus.Active
          ? PlatformRegistrationStatus.Registered
          : PlatformRegistrationStatus.Unregistered,
      organization: { id: subscription.organization_id },
    };
  },

  canUnregisterOCTIPlatform: async (
    context: PortalContext,
    { platformId }: CanUnregisterOctiPlatformInput
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

    const subscription = await loadSubscriptionBy(context, {
      service_instance_id: serviceConfiguration.service_instance_id,
    });
    if (!subscription) {
      throw new Error(ErrorCode.PlatformNotRegistered);
    }

    const { isAllowed, isInOrganization } = await isUserAllowedOnOrganization(
      context,
      {
        organizationId: subscription.organization_id,
        requiredCapability: OrganizationCapability.ManageOpenctiRegistration,
      }
    );

    return {
      isAllowed,
      isInOrganization,
      organizationId: subscription.organization_id,
    };
  },
};
