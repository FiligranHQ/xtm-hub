import { v4 as uuidv4 } from 'uuid';
import { db, QueryOpts } from '../../../../knexfile';
import {
  OctiPlatformContract,
  ServiceConfigurationStatus,
  ServiceDefinitionIdentifier,
} from '../../../__generated__/resolvers-types';
import { OrganizationId } from '../../../model/kanel/public/Organization';
import ServiceInstance, {
  ServiceInstanceId,
} from '../../../model/kanel/public/ServiceInstance';
import { SubscriptionId } from '../../../model/kanel/public/Subscription';
import { PortalContext } from '../../../model/portal-context';
import { ErrorCode } from '../../common/error-code';
import { loadSubscriptionBy } from '../../subcription/subscription.domain';
import { createSubscription } from '../../subcription/subscription.helper';
import { serviceContractDomain } from '../contract/domain';
import { serviceInstanceDomain } from '../instances/domain';

export type OCTIPlatformConfiguration = {
  registerer_id: string;
  platform_id: string;
  platform_url: string;
  platform_title: string;
  platform_contract: OctiPlatformContract;
  token: string;
};

export const registrationDomain = {
  registerNewPlatform: async (
    context: PortalContext,
    {
      serviceDefinitionId,
      organizationId,
      configuration,
    }: {
      serviceDefinitionId: string;
      organizationId: OrganizationId;
      configuration: OCTIPlatformConfiguration;
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

  refreshExistingPlatform: async (
    context: PortalContext,
    {
      configuration,
      serviceInstanceId,
      targetOrganizationId,
    }: {
      configuration: OCTIPlatformConfiguration;
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

    if (subscription.organization_id !== targetOrganizationId) {
      throw new Error(ErrorCode.RegistrationOnAnotherOrganizationForbidden);
    }

    await serviceContractDomain.updateConfiguration(
      context,
      serviceInstanceId,
      { config: configuration, status: ServiceConfigurationStatus.Active }
    );
  },

  loadOCTIPlatforms: async (
    context: PortalContext,
    opts: QueryOpts = {}
  ): Promise<{ config: OCTIPlatformConfiguration }[]> => {
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
        ServiceDefinitionIdentifier.OctiRegistration
      )
      .where('Subscription.organization_id', '=', userSelectedOrganization)
      .where('Subscription.status', '=', 'ACCEPTED')
      .whereNot((qb) => {
        qb.whereNotNull('Subscription.end_date').orWhere(
          'Service_Configuration.status',
          '=',
          ServiceConfigurationStatus.Inactive
        );
      })
      .whereIn('Subscription.joining', ['SELF_JOIN', 'AUTO_JOIN'])
      .select(['Service_Configuration.config'])
      .secureQuery();

    return query;
  },
};
