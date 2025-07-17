import { v4 as uuidv4 } from 'uuid';
import {
  CanEnrollResponse,
  CanEnrollStatus,
  EnrollOctiInstanceInput,
  OctiPlatform,
  OrganizationCapability,
  ServiceDefinitionIdentifier,
} from '../../../__generated__/resolvers-types';
import { OrganizationId } from '../../../model/kanel/public/Organization';
import { PortalContext } from '../../../model/portal-context';
import { isUserAllowed } from '../../../security/auth.helper';
import { ErrorCode } from '../../common/error-code';
import { loadSubscriptionBy } from '../../subcription/subscription.domain';
import { serviceContractDomain } from '../contract/domain';
import { serviceDefinitionDomain } from '../definition/domain';
import {
  enrollmentDomain,
  OCTIInstanceConfiguration,
} from './enrollment.domain';

export const enrollmentApp = {
  loadOctiInstances: async (
    context: PortalContext
  ): Promise<OctiPlatform[]> => {
    const instances = await enrollmentDomain.loadOctiInstances(context);
    return instances.map((instance) => ({
      __typename: 'OCTIPlatform',
      id: instance.config.platform_id,
      title: instance.config.platform_title,
      url: instance.config.platform_url,
      contract: instance.config.platform_contract,
    }));
  },

  enrollOCTIInstance: async (
    context: PortalContext,
    { organizationId, platform }: EnrollOctiInstanceInput
  ): Promise<string> => {
    const token = uuidv4();
    const configuration: OCTIInstanceConfiguration = {
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

    const existingServiceConfiguration =
      await serviceContractDomain.loadConfigurationByPlatform(
        context,
        platform.id
      );

    if (existingServiceConfiguration) {
      await enrollmentDomain.transferExistingInstance(context, {
        serviceInstanceId: existingServiceConfiguration.service_instance_id,
        targetOrganizationId: organizationId,
        configuration,
      });
    } else {
      await enrollmentDomain.enrollNewInstance(context, {
        serviceDefinitionId: serviceDefinition.id,
        organizationId: organizationId as OrganizationId,
        configuration,
      });
    }

    return token;
  },
  canEnrollOCTIInstance: async (
    context: PortalContext,
    {
      organizationId,
      platformId,
    }: { organizationId: string; platformId: string }
  ): Promise<CanEnrollResponse> => {
    const serviceConfiguration =
      await serviceContractDomain.loadConfigurationByPlatform(
        context,
        platformId
      );

    const isAllowedOnTargetOrganization = await isUserAllowed(context, {
      organizationId,
      capability: OrganizationCapability.ManageOctiEnrollment,
    });

    if (!serviceConfiguration) {
      return {
        status: CanEnrollStatus.NeverEnrolled,
        isAllowed: isAllowedOnTargetOrganization,
      };
    }

    const subscription = await loadSubscriptionBy(context, {
      service_instance_id: serviceConfiguration.service_instance_id,
    });

    if (!subscription) {
      throw new Error(ErrorCode.SubscriptionNotFound);
    }

    if (subscription.organization_id === organizationId) {
      return {
        status: CanEnrollStatus.Enrolled,
        isAllowed: isAllowedOnTargetOrganization,
        isSameOrganization: true,
      };
    }

    const isAllowedOnOriginOrganization = await isUserAllowed(context, {
      organizationId: subscription.organization_id,
      capability: OrganizationCapability.ManageOctiEnrollment,
    });

    return {
      status: CanEnrollStatus.Enrolled,
      isAllowed: isAllowedOnTargetOrganization && isAllowedOnOriginOrganization,
      isSameOrganization: false,
    };
  },
};
