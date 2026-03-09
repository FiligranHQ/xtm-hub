import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../../../knexfile';
import {
  DeploymentRequestDeploymentType,
  DeploymentRequestHubStatus,
  OrganizationCapability,
  PlatformContract,
  PlatformIdentifier,
  ServiceConfigurationStatus,
  ServiceDefinitionIdentifier,
  ServiceInstanceCreationStatus,
} from '../../../__generated__/resolvers-types';
import { requestContext } from '../../../context/request.context';
import { OrganizationId } from '../../../model/kanel/public/Organization';
import ServiceInstance, {
  ServiceInstanceId,
} from '../../../model/kanel/public/ServiceInstance';
import { SubscriptionId } from '../../../model/kanel/public/Subscription';
import { securityGuard } from '../../../security/guard';
import { ErrorCode } from '../../../utils/error/error.code';
import { loadOrganizationsByUser } from '../../organizations/organizations.domain';
import {
  createSubscription,
  loadSubscriptionBy,
  transferSubscriptionToOrganization,
} from '../../subcription/subscription.domain';
import { ServiceContractDomain } from '../contract/service-configuration.domain';
import { FullyQualifiedDeploymentRequest } from '../deployments/deployments.domain';

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

export interface DomainRegisteredPlatform {
  config: PlatformConfiguration;
  identifier: ServiceDefinitionIdentifier;
  illustration_document_id: string | null;
  id: string;
}

export const registrationDomain = {
  registerNewPlatform: async ({
    serviceDefinitionId,
    organizationId,
    configuration,
    platformIdentifier,
    serviceInstanceCreationStatus = ServiceInstanceCreationStatus.Ready,
  }: {
    serviceDefinitionId: string;
    organizationId: OrganizationId;
    configuration?: PlatformConfiguration;
    platformIdentifier: PlatformIdentifier;
    serviceInstanceCreationStatus?: ServiceInstanceCreationStatus;
  }): Promise<ServiceInstanceId> => {
    const { user } = requestContext.require();
    await securityGuard.assertUserIsAllowedOnOrganization(user, {
      organizationId,
      requiredCapability: OrganizationCapability.ManagePlatformRegistration,
    });

    const serviceInstanceId =
      await serviceInstanceDomain.createPlatformServiceInstance(
        serviceDefinitionId,
        platformIdentifier,
        serviceInstanceCreationStatus
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
      await ServiceContractDomain.createConfiguration(
        serviceInstanceId,
        configuration
      );
    }
    return serviceInstanceId;
  },

  refreshExistingPlatform: async ({
    configuration,
    serviceInstanceId,
    targetOrganizationId,
  }: {
    configuration: PlatformConfiguration;
    serviceInstanceId: ServiceInstanceId;
    targetOrganizationId: OrganizationId;
  }) => {
    const { user } = requestContext.require();
    await securityGuard.assertUserIsAllowedOnOrganization(user, {
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
      const userOrganizations = await loadOrganizationsByUser(user.id);
      if (userOrganizations.length > 2) {
        throw new Error(ErrorCode.RegistrationOnAnotherOrganizationForbidden);
      }

      await securityGuard.assertUserIsAllowedOnOrganization(user, {
        organizationId: subscription.organization_id,
        requiredCapability: OrganizationCapability.ManagePlatformRegistration,
      });

      await transferSubscriptionToOrganization({
        subscriptionId: subscription.id,
        organizationId: targetOrganizationId,
      });
    }

    await ServiceContractDomain.updateConfiguration(serviceInstanceId, {
      config: configuration,
      status: ServiceConfigurationStatus.Active,
    });
  },

  loadRegisteredPlatform: async (serviceInstanceId: ServiceInstanceId) => {
    return getRegisteredPlatformsDataQuery().where(
      'ServiceInstance.id',
      '=',
      serviceInstanceId
    );
  },

  loadRegisteredPlatforms: async (
    query: {
      platformIdentifier?: PlatformIdentifier;
      onlyActive?: boolean;
      onlyTrial?: boolean;
    } = {}
  ): Promise<DomainRegisteredPlatform[]> => {
    const { platformIdentifier, onlyActive, onlyTrial } = query;
    const serviceDefinitionIdentifiers = platformIdentifier
      ? [
          serviceDefinitionIdentifierMappedByPlatformIdentifier[
            platformIdentifier
          ],
        ]
      : Object.values(serviceDefinitionIdentifierMappedByPlatformIdentifier);

    return getRegisteredPlatformsDataQuery()
      .whereIn('ServiceDefinition.identifier', serviceDefinitionIdentifiers)
      .where(function () {
        this.where('Service_Configuration.status', '=', 'active').orWhereNull(
          'Service_Configuration.service_instance_id'
        );
      })
      .where(function () {
        if (onlyActive) {
          this.whereNull('DeploymentRequest.id').orWhere(function () {
            this.where(
              'DeploymentRequest.counts_in_orga_quota',
              '=',
              true
            ).andWhere(
              'DeploymentRequest.hub_status',
              '=',
              DeploymentRequestHubStatus.Active
            );
          });
        }
      })
      .where(function () {
        if (onlyTrial) {
          this.whereNotNull('DeploymentRequest.id').andWhere(function () {
            this.where(
              'DeploymentRequest.counts_in_orga_quota',
              '=',
              true
            ).andWhere(
              'DeploymentRequest.type',
              '=',
              DeploymentRequestDeploymentType.Trial
            );
          });
        }
      });
  },
};

const getRegisteredPlatformsDataQuery =
  (): Knex.QueryBuilder<FullyQualifiedDeploymentRequest> => {
    const { user } = requestContext.require();
    const userSelectedOrganization = user.selected_organization_id;
    return db<ServiceInstance>('ServiceInstance')
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
      .leftJoin(
        'DeploymentRequest',
        'DeploymentRequest.service_instance_id',
        '=',
        'ServiceInstance.id'
      )
      .where('ServiceInstance.creation_status', '!=', 'DISABLED')
      .where('Subscription.organization_id', '=', userSelectedOrganization)
      .where('Subscription.status', '=', 'ACCEPTED')
      .whereIn('Subscription.joining', ['SELF_JOIN', 'AUTO_JOIN'])
      .select([
        'Service_Configuration.config',
        'ServiceDefinition.identifier',
        'ServiceInstance.*',
      ]);
  };
