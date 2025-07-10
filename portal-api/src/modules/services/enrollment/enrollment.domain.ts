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
  transferExistingInstance: async (
    context: PortalContext,
    {
      configuration,
      serviceInstanceId,
      targetOrganizationId,
    }: {
      configuration: OCTIInstanceConfiguration;
      serviceInstanceId: string;
      targetOrganizationId: string;
    }
  ) => {
    const subscription = await loadSubscriptionByServiceInstance(
      context,
      serviceInstanceId
    );

    if (!subscription) {
      throw new Error('SUBSCRIPTION_NOT_FOUND');
    }

    const originOrganizationId = subscription.organization_id;
    if (originOrganizationId !== targetOrganizationId) {
      const isAllowed = await isUserAllowed(context, {
        organizationId: originOrganizationId,
        capability: OrganizationCapability.ManageOctiEnrollment,
      });

      if (!isAllowed) {
        throw new Error('MISSING_CAPABILITY_ON_ORIGIN_ORGANIZATION');
      }
    }

    await serviceContractDomain.updateConfiguration(
      context,
      serviceInstanceId,
      configuration
    );
  },
};
