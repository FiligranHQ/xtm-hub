import { v4 as uuidv4 } from 'uuid';
import { db, QueryOpts } from '../../../../knexfile';
import {
  OrganizationCapability,
  PlatformContract,
  PlatformIdentifier,
  ServiceConfigurationStatus,
  ServiceDefinitionIdentifier,
  ServiceInstanceCreationStatus,
} from '../../../__generated__/resolvers-types';
import { OrganizationId } from '../../../model/kanel/public/Organization';
import ServiceInstance, {
  ServiceInstanceId,
} from '../../../model/kanel/public/ServiceInstance';
import { SubscriptionId } from '../../../model/kanel/public/Subscription';
import { PortalContext } from '../../../model/portal-context';
import { requestContext } from '../../../requestContext';
import { securityGuard } from '../../../security/guard';
import { ErrorCode } from '../../../utils/error/error.code';
import { loadOrganizationsByUser } from '../../organizations/organizations.domain';
import {
  createSubscription,
  loadSubscriptionBy,
  transferSubscriptionToOrganization,
} from '../../subcription/subscription.domain';
import { serviceContractDomain } from '../contract/domain';
import { serviceInstanceDomain } from '../instances/domain';
import { serviceDefinitionIdentifierMappedByPlatformIdentifier } from './registration.mapping';

export type PlatformConfiguration = {
  registerer_id: string;
  platform_id: string;
  platform_url: string;
  platform_title: string;
  platform_version: string;
  platform_contract: PlatformContract;
  token: string;
};

export const registrationDomain = {
  registerNewPlatform: async ({
    serviceDefinitionId,
    organizationId,
    configuration,
    platformIdentifier,
  }: {
    serviceDefinitionId: string;
    organizationId: OrganizationId;
    configuration?: PlatformConfiguration;
    platformIdentifier: PlatformIdentifier;
  }): Promise<ServiceInstanceId> => {
    const context = requestContext.require().portalContext;
    await securityGuard.assertUserIsAllowedOnOrganization(context, {
      organizationId,
      requiredCapability: OrganizationCapability.ManagePlatformRegistration,
    });

    const serviceInstanceId =
      await serviceInstanceDomain.createPlatformServiceInstance(
        context,
        serviceDefinitionId,
        platformIdentifier,
        configuration
          ? ServiceInstanceCreationStatus.Ready
          : ServiceInstanceCreationStatus.Pending
      );

    await createSubscription({
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

    if (configuration) {
      await serviceContractDomain.createConfiguration(
        context,
        serviceInstanceId,
        configuration
      );
    }
    return serviceInstanceId;
  },

  refreshExistingPlatform: async (
    context: PortalContext,
    {
      configuration,
      serviceInstanceId,
      targetOrganizationId,
    }: {
      configuration: PlatformConfiguration;
      serviceInstanceId: ServiceInstanceId;
      targetOrganizationId: OrganizationId;
    }
  ) => {
    await securityGuard.assertUserIsAllowedOnOrganization(context, {
      organizationId: targetOrganizationId,
      requiredCapability: OrganizationCapability.ManagePlatformRegistration,
    });
    const subscription = await loadSubscriptionBy({
      service_instance_id: serviceInstanceId,
    });
    if (!subscription) {
      throw new Error(ErrorCode.SubscriptionNotFound);
    }

    if (subscription.organization_id !== targetOrganizationId) {
      const userOrganizations = await loadOrganizationsByUser(context.user.id);
      if (userOrganizations.length > 2) {
        throw new Error(ErrorCode.RegistrationOnAnotherOrganizationForbidden);
      }

      await securityGuard.assertUserIsAllowedOnOrganization(context, {
        organizationId: subscription.organization_id,
        requiredCapability: OrganizationCapability.ManagePlatformRegistration,
      });

      await transferSubscriptionToOrganization({
        subscriptionId: subscription.id,
        organizationId: targetOrganizationId,
      });
    }

    await serviceContractDomain.updateConfiguration(
      context,
      serviceInstanceId,
      { config: configuration, status: ServiceConfigurationStatus.Active }
    );
  },

  loadRegisteredPlatforms: async (
    context: PortalContext,
    platformIdentifier?: PlatformIdentifier,
    opts: QueryOpts = {}
  ): Promise<
    {
      config: PlatformConfiguration;
      identifier: ServiceDefinitionIdentifier;
      illustration_document_id: string | null;
      id: string;
    }[]
  > => {
    const userSelectedOrganization = context.user.selected_organization_id;
    const serviceDefinitionIdentifier =
      serviceDefinitionIdentifierMappedByPlatformIdentifier[platformIdentifier];

    return await db<ServiceInstance>(context, 'ServiceInstance', opts)
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
      .modify((queryBuilder) => {
        if (platformIdentifier) {
          queryBuilder.where(
            'ServiceDefinition.identifier',
            '=',
            serviceDefinitionIdentifier
          );
        }
      })
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
      .select([
        'Service_Configuration.config',
        'ServiceDefinition.identifier',
        'ServiceInstance.illustration_document_id',
        'ServiceInstance.id',
      ])
      .secureQuery();
  },
};
