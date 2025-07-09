import { v4 as uuidv4 } from 'uuid';
import {
  CanEnrollResponse,
  CanEnrollStatus,
  OrganizationCapability,
  ServiceDefinitionIdentifier,
} from '../../../__generated__/resolvers-types';
import { PortalContext } from '../../../model/portal-context';
import { userHasBypassCapability } from '../../../security/auth.helper';
import { loadUserOrganizationCapabilities } from '../../common/user-organization-capability.domain';
import { loadSubscriptionByServiceInstance } from '../../subcription/subscription.domain';
import { insertSubscription } from '../../subcription/subscription.helper';
import { serviceContractDomain } from '../contract/domain';
import { serviceDefinitionHelper } from '../definition/helper';
import { serviceInstanceHelper } from '../instances/helper';

interface EnrollOCTIInstancePayload {
  organizationId: string;
  platformId: string;
  platformUrl: string;
  platformTitle: string;
}

export const enrollmentApp = {
  enrollOCTIInstance: async (
    context: PortalContext,
    payload: EnrollOCTIInstancePayload
  ): Promise<string> => {
    const token = uuidv4();
    const configuration = {
      enroller_id: context.user.id,
      platform_id: payload.platformId,
      platform_url: payload.platformUrl,
      platform_title: payload.platformTitle,
      token: token,
    };

    const serviceDefinition = await serviceDefinitionHelper.findByIdentifier(
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

    // insert service instance
    const serviceInstanceId =
      await serviceInstanceHelper.createOCTIServiceInstance(
        context,
        serviceDefinition.id
      );

    await insertSubscription(context, {
      id: uuidv4(),
      organization_id: payload.organizationId,
      service_instance_id: serviceInstanceId,
      start_date: new Date(),
      end_date: null,
      status: 'ACCEPTED',
      joining: 'AUTO_JOIN',
      billing: 0,
      justification: null,
    });

    await serviceContractDomain.saveConfiguration(
      context,
      serviceInstanceId,
      configuration
    );

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

    if (!serviceConfiguration) {
      return {
        status: CanEnrollStatus.NeverEnrolled,
        allowed: true,
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
        allowed: true,
        sameOrganization: true,
      };
    }

    const capabilities = await loadUserOrganizationCapabilities(
      context,
      subscription.organization_id
    );

    const hasCapability =
      userHasBypassCapability(context.user) ||
      capabilities.some(
        (c) => c.name === OrganizationCapability.ManageOctiEnrollment
      );

    return {
      status: CanEnrollStatus.Enrolled,
      allowed: hasCapability,
      sameOrganization: false,
    };
  },
};
