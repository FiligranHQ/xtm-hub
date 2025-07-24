import { v4 as uuidv4 } from 'uuid';
import {
  CanEnrollResponse,
  CanEnrollStatus,
  CanUnenrollOctiPlatformInput,
  EnrollOctiPlatformInput,
  OctiPlatform,
  OrganizationCapability,
  ServiceConfigurationStatus,
  ServiceDefinitionIdentifier,
} from '../../../__generated__/resolvers-types';
import { OrganizationId } from '../../../model/kanel/public/Organization';
import ServiceConfiguration from '../../../model/kanel/public/ServiceConfiguration';
import Subscription from '../../../model/kanel/public/Subscription';
import { PortalContext } from '../../../model/portal-context';
import { isUserAllowed } from '../../../security/auth.helper';
import { ErrorCode } from '../../common/error-code';
import {
  endSubscription,
  loadActiveSubscriptionBy,
  loadLastSubscriptionByServiceInstance,
} from '../../subcription/subscription.domain';
import { serviceContractDomain } from '../contract/domain';
import { serviceDefinitionDomain } from '../definition/domain';
import {
  enrollmentDomain,
  OCTIPlatformConfiguration,
} from './enrollment.domain';

const loadActiveOrLastSubscription = async (
  context: PortalContext,
  serviceConfigurations: ServiceConfiguration[]
): Promise<{ subscription?: Subscription; isActive: boolean }> => {
  const activeConfiguration = serviceConfigurations.find(
    (configuration) =>
      configuration.status === ServiceConfigurationStatus.Active
  );
  if (activeConfiguration) {
    const subscription = await loadActiveSubscriptionBy(context, {
      service_instance_id: activeConfiguration.service_instance_id,
    });
    return {
      subscription,
      isActive: true,
    };
  }

  const subscription = await loadLastSubscriptionByServiceInstance(
    context,
    serviceConfigurations.map(
      (configuration) => configuration.service_instance_id
    )
  );
  return {
    subscription,
    isActive: false,
  };
};

export const enrollmentApp = {
  loadOCTIPlatforms: async (
    context: PortalContext
  ): Promise<OctiPlatform[]> => {
    const platforms = await enrollmentDomain.loadOCTIPlatforms(context);
    return platforms.map((platform) => ({
      __typename: 'OCTIPlatform',
      id: platform.config.platform_id,
      platform_id: platform.config.platform_id,
      title: platform.config.platform_title,
      url: platform.config.platform_url,
      contract: platform.config.platform_contract,
    }));
  },

  enrollOCTIPlatform: async (
    context: PortalContext,
    { organizationId, platform }: EnrollOctiPlatformInput
  ): Promise<string> => {
    const token = uuidv4();
    const configuration: OCTIPlatformConfiguration = {
      enroller_id: context.user.id,
      platform_id: platform.id,
      platform_url: platform.url,
      platform_title: platform.title,
      platform_contract: platform.contract,
      token: token,
    };

    const serviceDefinition =
      await serviceDefinitionDomain.loadServiceDefinitionBy(context, {
        identifier: ServiceDefinitionIdentifier.OctiEnrollment,
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

    const activeServiceConfiguration =
      await serviceContractDomain.loadConfigurationByPlatform(
        context,
        platform.id,
        ServiceConfigurationStatus.Active
      );

    if (activeServiceConfiguration) {
      await enrollmentDomain.transferExistingPlatform(context, {
        serviceInstanceId: activeServiceConfiguration.service_instance_id,
        targetOrganizationId: organizationId,
        configuration,
      });
    } else {
      await enrollmentDomain.enrollNewPlatform(context, {
        serviceDefinitionId: serviceDefinition.id,
        organizationId: organizationId as OrganizationId,
        configuration,
      });
    }

    return token;
  },

  unenrollOCTIPlatform: async (
    context: PortalContext,
    { platformId }: CanUnenrollOctiPlatformInput
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

    const subscription = await loadActiveSubscriptionBy(context, {
      service_instance_id: activeServiceConfiguration.service_instance_id,
    });
    if (!subscription) {
      throw new Error(ErrorCode.SubscriptionNotFound);
    }

    const isAllowed = await isUserAllowed(context, {
      organizationId: subscription.organization_id,
      capability: OrganizationCapability.ManageOctiEnrollment,
    });
    if (!isAllowed) {
      throw new Error(ErrorCode.MissingCapabilityOnOriginOrganization);
    }

    await serviceContractDomain.updateConfiguration(
      context,
      activeServiceConfiguration.service_instance_id,
      { status: ServiceConfigurationStatus.Inactive }
    );

    await endSubscription(context, subscription.id);
  },

  canEnrollOCTIPlatform: async (
    context: PortalContext,
    {
      organizationId,
      platformId,
    }: { organizationId: string; platformId: string }
  ): Promise<CanEnrollResponse> => {
    const serviceConfigurations =
      await serviceContractDomain.loadConfigurationsByPlatform(
        context,
        platformId
      );
    const isAllowedOnTargetOrganization = await isUserAllowed(context, {
      organizationId,
      capability: OrganizationCapability.ManageOctiEnrollment,
    });

    const wasEnrolledOnce = !!serviceConfigurations.length;
    if (!wasEnrolledOnce) {
      return {
        status: CanEnrollStatus.NeverEnrolled,
        isAllowed: isAllowedOnTargetOrganization,
      };
    }

    const { subscription, isActive } = await loadActiveOrLastSubscription(
      context,
      serviceConfigurations
    );
    if (!subscription) {
      throw new Error(ErrorCode.SubscriptionNotFound);
    }

    const enrolledStatus = isActive
      ? CanEnrollStatus.Enrolled
      : CanEnrollStatus.Unenrolled;
    const isSameOrganization = subscription.organization_id === organizationId;
    const isAllowed = async () => {
      if (isSameOrganization) {
        return isAllowedOnTargetOrganization;
      }

      const isAllowedOnOriginOrganization = await isUserAllowed(context, {
        organizationId: subscription.organization_id,
        capability: OrganizationCapability.ManageOctiEnrollment,
      });

      return isAllowedOnTargetOrganization && isAllowedOnOriginOrganization;
    };

    return {
      status: enrolledStatus,
      isSameOrganization,
      isAllowed: await isAllowed(),
    };
  },

  canUnenrollOCTIPlatform: async (
    context: PortalContext,
    { platformId }: CanUnenrollOctiPlatformInput
  ): Promise<{ isAllowed: boolean; organizationId: OrganizationId }> => {
    const serviceConfiguration =
      await serviceContractDomain.loadConfigurationByPlatform(
        context,
        platformId,
        ServiceConfigurationStatus.Active
      );
    if (!serviceConfiguration) {
      throw new Error(ErrorCode.PlatformNotEnrolled);
    }

    const subscription = await loadActiveSubscriptionBy(context, {
      service_instance_id: serviceConfiguration.service_instance_id,
    });
    if (!subscription) {
      throw new Error(ErrorCode.PlatformNotEnrolled);
    }

    const isAllowed = await isUserAllowed(context, {
      organizationId: subscription.organization_id,
      capability: OrganizationCapability.ManageOctiEnrollment,
    });

    return { isAllowed, organizationId: subscription.organization_id };
  },
};
