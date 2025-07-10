import { v4 as uuidv4 } from 'uuid';
import { OrganizationCapability } from '../../../__generated__/resolvers-types';
import { PortalContext } from '../../../model/portal-context';
import { isUserAllowed } from '../../../security/auth.helper';
import { loadSubscriptionByServiceInstance } from '../../subcription/subscription.domain';
import { insertSubscription } from '../../subcription/subscription.helper';
import { serviceContractDomain } from '../contract/domain';
import { serviceInstanceHelper } from '../instances/helper';

export type OCTIInstanceConfiguration = {
  enroller_id: string;
  platform_id: string;
  platform_url: string;
  platform_title: string;
  token: string;
};

export const enrollmentDomain = {
  enrollNewInstance: async (
    context: PortalContext,
    {
      serviceDefinitionId,
      organizationId,
      configuration,
    }: {
      serviceDefinitionId: string;
      organizationId: string;
      configuration: OCTIInstanceConfiguration;
    }
  ) => {
    const serviceInstanceId =
      await serviceInstanceHelper.createOCTIServiceInstance(
        context,
        serviceDefinitionId
      );

    await insertSubscription(context, {
      id: uuidv4(),
      organization_id: organizationId,
      service_instance_id: serviceInstanceId,
      start_date: new Date(),
      end_date: null,
      status: 'ACCEPTED',
      joining: 'AUTO_JOIN',
      billing: 0,
      justification: null,
    });

    await serviceContractDomain.insertConfiguration(
      context,
      serviceInstanceId,
      configuration
    );
  },
  enrollExistingInstance: async (
    context: PortalContext,
    {
      configuration,
      serviceInstanceId,
      organizationId,
    }: {
      configuration: OCTIInstanceConfiguration;
      serviceInstanceId: string;
      organizationId: string;
    }
  ) => {
    const subscription = await loadSubscriptionByServiceInstance(
      context,
      serviceInstanceId
    );

    if (!subscription) {
      throw new Error('SUBSCRIPTION_NOT_FOUND');
    }

    if (subscription.organization_id !== organizationId) {
      const isAllowed = await isUserAllowed(context, {
        organizationId: subscription.organization_id,
        capability: OrganizationCapability.ManageOctiEnrollment,
      });

      if (!isAllowed) {
        throw new Error('MISSING_CAPABILITY_ON_DESTINATION_ORGANIZATION');
      }
    }

    await serviceContractDomain.updateConfiguration(
      context,
      serviceInstanceId,
      configuration
    );
  },
};
