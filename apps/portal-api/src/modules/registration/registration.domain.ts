import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../../knexfile';
import {
  DeploymentRequestDeploymentType,
  DeploymentRequestHubStatus,
  OrganizationCapability,
  PlatformContract,
  PlatformIdentifier,
  ServiceConfigurationStatus,
  ServiceDefinitionIdentifier,
  ServiceInstanceCreationStatus,
} from '../../__generated__/resolvers-types';
import { requestContext } from '../../context/request.context';
import { OrganizationId } from '../../model/kanel/public/Organization';
import ServiceInstance, {
  ServiceInstanceId,
} from '../../model/kanel/public/ServiceInstance';
import { SubscriptionId } from '../../model/kanel/public/Subscription';
import { securityGuard } from '../../security/guard';
import { ErrorCode } from '../../utils/error/error.code';
import { FullyQualifiedDeploymentRequest } from '../deployment/deployment.domain';
import { loadOrganizationsByUser } from '../organization-management/organization/organization.domain';
import {
  createSubscription,
  loadSubscriptionBy,
  transferSubscriptionToOrganization,
} from '../subscription/subscription.domain';
import { ServiceConfigurationDomain } from './service-configuration/service-configuration.domain';

import { DocumentId } from '../../model/kanel/public/Document';
import { ServiceInstanceDomain } from '../service/instance/service-instance.domain';
import { serviceDefinitionIdentifierMappedByPlatformIdentifier } from './registration.mapping';

export type PlatformConfiguration = {
  registerer_id: string;
  platform_id: string;
  tenant_id?: string;
  platform_url: string;
  platform_title: string;
  platform_version: string;
  platform_contract: PlatformContract;
  token: string;
};

export interface DomainRegisteredPlatform {
  config: PlatformConfiguration;
  identifier: ServiceDefinitionIdentifier;
  illustration_document_id: DocumentId | null;
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
      await ServiceInstanceDomain.createPlatformServiceInstance(
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
    });

    if (configuration) {
      await ServiceConfigurationDomain.createConfiguration(
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

    await ServiceConfigurationDomain.updateConfiguration(serviceInstanceId, {
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

  loadRegisteredPlatformsByOrganizationIds: async (
    organizationIds: OrganizationId[],
    platformIdentifier: PlatformIdentifier
  ): Promise<DomainRegisteredPlatform[]> => {
    if (organizationIds.length === 0) {
      return [];
    }

    const serviceDefinitionIdentifier =
      serviceDefinitionIdentifierMappedByPlatformIdentifier[platformIdentifier];

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
      .where('ServiceInstance.creation_status', '!=', 'DISABLED')
      .whereIn('Subscription.organization_id', organizationIds)
      .where('ServiceDefinition.identifier', '=', serviceDefinitionIdentifier)
      .where(
        'Service_Configuration.status',
        '=',
        ServiceConfigurationStatus.Active
      )
      .select([
        'Service_Configuration.config',
        'ServiceDefinition.identifier',
        'ServiceInstance.*',
      ]) as unknown as Promise<DomainRegisteredPlatform[]>;
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
      .select([
        'Service_Configuration.config',
        'ServiceDefinition.identifier',
        'ServiceInstance.*',
      ]);
  };
