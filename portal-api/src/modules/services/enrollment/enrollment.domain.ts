import { v4 as uuidv4 } from 'uuid';
import { db, QueryOpts } from '../../../../knexfile';
import {
  OctiPlatformContract,
  OrganizationCapability,
  ServiceDefinitionIdentifier,
} from '../../../__generated__/resolvers-types';
import { OrganizationId } from '../../../model/kanel/public/Organization';
import ServiceInstance, {
  ServiceInstanceId,
} from '../../../model/kanel/public/ServiceInstance';
import { SubscriptionId } from '../../../model/kanel/public/Subscription';
import { PortalContext } from '../../../model/portal-context';
import { isUserAllowed } from '../../../security/auth.helper';
import { ErrorCode } from '../../common/error-code';
import {
  loadSubscriptionBy,
  transferSubscription,
} from '../../subcription/subscription.domain';
import { createSubscription } from '../../subcription/subscription.helper';
import { serviceContractDomain } from '../contract/domain';
import { serviceInstanceDomain } from '../instances/domain';

export type OCTIInstanceConfiguration = {
  enroller_id: string;
  platform_id: string;
  platform_url: string;
  platform_title: string;
  platform_contract: OctiPlatformContract;
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
      organizationId: OrganizationId;
      configuration: OCTIInstanceConfiguration;
    }
  ) => {
    const serviceInstanceId =
      await serviceInstanceDomain.createOCTIServiceInstance(
        context,
        serviceDefinitionId
      );

    await createSubscription(context, {
      id: uuidv4() as SubscriptionId,
      organization_id: organizationId,
      service_instance_id: serviceInstanceId,
      start_date: new Date(),
      end_date: null,
      status: 'ACCEPTED',
      joining: 'AUTO_JOIN',
      billing: 0,
      justification: null,
    });

    await serviceContractDomain.createConfiguration(
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
      serviceInstanceId: ServiceInstanceId;
      targetOrganizationId: string;
    }
  ) => {
    const subscription = await loadSubscriptionBy(context, {
      service_instance_id: serviceInstanceId,
    });

    if (!subscription) {
      throw new Error(ErrorCode.SubscriptionNotFound);
    }

    const originOrganizationId = subscription.organization_id;
    if (originOrganizationId !== targetOrganizationId) {
      const isAllowed = await isUserAllowed(context, {
        organizationId: originOrganizationId,
        capability: OrganizationCapability.ManageOctiEnrollment,
      });

      if (!isAllowed) {
        throw new Error(ErrorCode.MissingCapabilityOnOriginOrganization);
      }
    }

    await serviceContractDomain.updateConfiguration(
      context,
      serviceInstanceId,
      configuration
    );

    await transferSubscription(context, {
      subscriptionId: subscription.id,
      targetOrganizationId,
    });
  },

  octiInstances: async (
    context: PortalContext,
    opts: QueryOpts = {}
  ): Promise<{ config: OCTIInstanceConfiguration }[]> => {
    const userSelectedOrganization = context.user.selected_organization_id;

    const query = await db<ServiceInstance>(context, 'ServiceInstance', opts)
      .leftJoin(
        'Service_Configuration',
        'Service_Configuration.service_instance_id',
        '=',
        'ServiceInstance.id'
      )
      .leftJoin(
        'ServiceDefinition',
        'ServiceDefinition.id',
        '=',
        'ServiceInstance.service_definition_id'
      )
      .leftJoin(
        'Subscription',
        'Subscription.service_instance_id',
        '=',
        'ServiceInstance.id'
      )
      .where(
        'ServiceDefinition.identifier',
        '=',
        ServiceDefinitionIdentifier.OctiEnrollment
      )
      .where('Subscription.organization_id', '=', userSelectedOrganization)
      .where('Subscription.status', '=', 'ACCEPTED')
      .whereIn('Subscription.joining', ['SELF_JOIN', 'AUTO_JOIN'])
      .select(['Service_Configuration.config']);

    return query;
  },
};
