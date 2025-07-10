import { v4 as uuidv4 } from 'uuid';
import {
  CanEnrollResponse,
  CanEnrollStatus,
  OrganizationCapability,
  ServiceDefinitionIdentifier,
} from '../../../__generated__/resolvers-types';
import { PortalContext } from '../../../model/portal-context';
import { isUserAllowed } from '../../../security/auth.helper';
import { loadSubscriptionByServiceInstance } from '../../subcription/subscription.domain';
import { serviceContractDomain } from '../contract/domain';
import { serviceDefinitionDomain } from '../definition/domain';
import {
  enrollmentDomain,
  OCTIInstanceConfiguration,
} from './enrollment.domain';

interface EnrollOCTIInstancePayload {
  organizationId: string;
  platformId: string;
  platformUrl: string;
  platformTitle: string;
}

export const enrollmentApp = {
  enrollOCTIInstance: async (
    context: PortalContext,
    {
      organizationId,
      platformId,
      platformUrl,
      platformTitle,
    }: EnrollOCTIInstancePayload
  ): Promise<string> => {
    const token = uuidv4();
    const configuration: OCTIInstanceConfiguration = {
      enroller_id: context.user.id,
      platform_id: platformId,
      platform_url: platformUrl,
      platform_title: platformTitle,
      token: token,
    };

    const serviceDefinition = await serviceDefinitionDomain.findByIdentifier(
      context,
      ServiceDefinitionIdentifier.OctiEnrollment
    );
    if (!serviceDefinition) {
      throw new Error('SERVICE_DEFINITION_NOT_FOUND');
    }

    const isConfigurationValid =
      await serviceContractDomain.isServiceConfigurationValid(
        context,
        serviceDefinition.id,
        configuration
      );
    if (!isConfigurationValid) {
      throw new Error('INVALID_SERVICE_CONFIGURATION');
    }

    const existingServiceConfiguration =
      await serviceContractDomain.findConfiguration(context, platformId);

    if (existingServiceConfiguration) {
      await enrollmentDomain.transferExistingInstance(context, {
        serviceInstanceId: existingServiceConfiguration.service_instance_id,
        targetOrganizationId: organizationId,
        configuration,
      });
    } else {
      await enrollmentDomain.enrollNewInstance(context, {
        serviceDefinitionId: serviceDefinition.id,
        organizationId,
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
    const serviceConfiguration = await serviceContractDomain.findConfiguration(
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

    const subscription = await loadSubscriptionByServiceInstance(
      context,
      serviceConfiguration.service_instance_id
    );

    if (!subscription) {
      throw new Error('SUBSCRIPTION_NOT_FOUND');
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
