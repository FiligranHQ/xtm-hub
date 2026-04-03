import { toGlobalId } from 'graphql-relay/node/node.js';
import {
  RegisteredPlatform,
  SeoServiceInstance,
  ServiceDefinitionIdentifier,
  ServiceInstance,
  ServiceInstanceJoinType,
  ServiceInstanceTag,
  UpdatePlatformServiceMetadataInput,
} from '../../__generated__/resolvers-types';
import { withTransaction } from '../../context/database.context';
import {
  ServiceInstanceId,
  ServiceInstanceMutator,
} from '../../model/kanel/public/ServiceInstance';
import { UserId } from '../../model/kanel/public/User';
import { UserLoadUserBy } from '../../model/user';
import { dispatch } from '../../pub';
import { securityGuard } from '../../security/guard';
import { logApp } from '../../utils/app-logger.util';
import { ErrorCode } from '../../utils/error/error.code';
import { NotFoundError } from '../../utils/error/error.util';
import { PlatformConfiguration } from '../registration/registration.domain';
import { subscriptionApp } from '../subcription/subscription.app';
import { loadSubscriptionBy } from '../subcription/subscription.domain';
import { GenericServiceCapabilityIds } from '../user_service/service-capability/generic_service_capability.const';
import { UserServiceDomain } from '../user_service/user_service.domain';
import { uploadNewFile } from './document/document.helper';
import { Upload } from './document/document.uploads.helper';
import {
  grantServiceAccess,
  loadPlatformConfigurationByServiceInstanceId,
  loadPlatformServiceInstance,
  loadSeoServiceInstanceBySlug,
  loadSeoServiceInstances,
  loadServiceDefinitionByServiceInstance,
  loadServiceInstanceBy,
  loadSubscribedServiceInstancesByIdentifier,
  ServiceInstanceDomain,
  updatePlatformConfigurationByServiceInstanceId,
  updateServiceInstance,
} from './service-instance.domain';

export const ServiceInstanceApp = {
  loadServiceInstance: async (
    user: UserLoadUserBy,
    serviceInstanceId: ServiceInstanceId
  ): Promise<ServiceInstance> => {
    const service = await loadServiceInstanceBy('id', serviceInstanceId);
    let subscription = await loadSubscriptionBy({
      service_instance_id: serviceInstanceId,
      organization_id: user.selected_organization_id,
    });

    if (
      !subscription &&
      service.join_type == ServiceInstanceJoinType.JoinAuto
    ) {
      subscription = await subscriptionApp.subscribeOrganizationToService({
        organizationId: user.selected_organization_id,
        serviceInstanceId: serviceInstanceId,
        startDate: new Date(),
        endDate: null,
        capabilityIds: [],
      });
    }
    const userService = await UserServiceDomain.loadUserServiceBy({
      subscription_id: subscription.id,
      user_id: user.id,
    });
    if (userService.length === 0) {
      if (subscription.joining === 'AUTO_JOIN') {
        await grantServiceAccess(
          [GenericServiceCapabilityIds.AccessId],
          [user.id],
          subscription.id
        );
      } else {
        logApp.warn('USER_MUST_JOIN_SERVICE_BEFORE_ACCESSING_IT', {
          userId: user.id,
          serviceInstanceId,
        });
      }
    }
    return service;
  },

  addServicePicture: async (
    serviceInstanceId: ServiceInstanceId,
    document: Upload,
    isLogo: boolean
  ): Promise<ServiceInstance> => {
    const updatedServiceInstance = await withTransaction(async () => {
      const uploadedDocument = await uploadNewFile(document, serviceInstanceId);
      const update = isLogo
        ? { logo_document_id: uploadedDocument.id }
        : { illustration_document_id: uploadedDocument.id };
      return updateServiceInstance(serviceInstanceId, update);
    });
    await dispatch('ServiceInstance', 'edit', updatedServiceInstance);
    return updatedServiceInstance as unknown as ServiceInstance;
  },

  updatePlatformServiceMetadata: async (
    user: UserLoadUserBy,
    serviceInstanceId: ServiceInstanceId,
    input: UpdatePlatformServiceMetadataInput,
    upload: Upload | null
  ): Promise<RegisteredPlatform> => {
    const serviceInstance = await loadPlatformServiceInstance(
      user.selected_organization_id,
      serviceInstanceId
    );

    if (!serviceInstance) {
      throw NotFoundError(ErrorCode.ServiceInstanceNotFound);
    }

    // Get service definition
    const serviceDefinition = await loadServiceDefinitionByServiceInstance(
      serviceInstance.id
    );

    if (!serviceDefinition) {
      throw NotFoundError(ErrorCode.ServiceDefinitionNotFound);
    }

    // Verify platform type and check capabilities
    await securityGuard.assertUserCanModifyPlatformService(
      user,
      serviceDefinition
    );

    // Build update object for ServiceInstance
    const updateData: ServiceInstanceMutator = {};

    // Update ServiceInstance name if provided
    if (input.name) {
      updateData.name = input.name;
    }

    // Handle illustration image upload if provided
    if (upload) {
      const document = await uploadNewFile(upload, serviceInstance.id);
      updateData.illustration_document_id = document.id;
    }

    const updatedServiceInstance = await withTransaction(async () => {
      // Update ServiceInstance if there are fields to update
      let result = serviceInstance;
      if (Object.keys(updateData).length > 0) {
        result = await updateServiceInstance(serviceInstance.id, updateData);
      }

      // For registered platforms, also update the configuration JSON for platform_title
      if (input.name) {
        const currentConfig =
          await loadPlatformConfigurationByServiceInstanceId(
            serviceInstance.id
          );

        if (currentConfig) {
          const config = currentConfig.config as PlatformConfiguration;
          config.platform_title = input.name;

          await updatePlatformConfigurationByServiceInstanceId(
            serviceInstance.id,
            config
          );
        }
      }
      return result;
    });

    await dispatch('ServiceInstance', 'edit', updatedServiceInstance);

    // Build RegisteredPlatform response
    const config = await loadPlatformConfigurationByServiceInstanceId(
      updatedServiceInstance.id
    );

    if (!config) {
      throw NotFoundError(ErrorCode.ServiceConfigurationNotFound);
    }

    const platformConfig = config.config as PlatformConfiguration;
    return {
      __typename: 'RegisteredPlatform',
      id: updatedServiceInstance.id,
      platform_id: platformConfig.platform_id,
      title: platformConfig.platform_title,
      url: platformConfig.platform_url,
      contract: platformConfig.platform_contract,
      version: platformConfig.platform_version,
      identifier: serviceDefinition.identifier,
      illustration_document_id: updatedServiceInstance.illustration_document_id
        ? toGlobalId(
            'Document',
            updatedServiceInstance.illustration_document_id
          )
        : null,
    } as RegisteredPlatform;
  },

  loadSeoServiceInstances: async (): Promise<SeoServiceInstance[]> => {
    const services = await loadSeoServiceInstances();
    return services.map(withServiceInstanceGlobalIDs);
  },

  loadSeoServiceInstance: async (slug: string): Promise<SeoServiceInstance> => {
    const serviceInstance = await loadSeoServiceInstanceBySlug(slug);
    if (!serviceInstance) {
      throw Error(ErrorCode.ServiceNotFound);
    }
    return {
      ...withServiceInstanceGlobalIDs(serviceInstance),
    };
  },

  loadLinkServiceInstancesByTags: async (
    tags: ServiceInstanceTag[]
  ): Promise<SeoServiceInstance[]> => {
    const serviceInstances =
      await ServiceInstanceDomain.loadServiceInstancesByServiceDefinitionAndTagsWithoutSubscription(
        ServiceDefinitionIdentifier.Link,
        tags
      );

    return serviceInstances.map((serviceInstance) => ({
      ...withServiceInstanceGlobalIDs(serviceInstance),
    }));
  },

  loadSubscribedServiceInstancesByIdentifier: async (
    userId: UserId,
    identifier: string
  ) => {
    const results = await loadSubscribedServiceInstancesByIdentifier(
      userId,
      identifier
    );
    return results.map((sub) => ({
      ...sub,
      organization_id: toGlobalId('Organization', sub.organization_id),
      service_instance_id: toGlobalId(
        'ServiceInstance',
        sub.service_instance_id
      ),
    }));
  },
};

/**
 * Transforms raw document IDs into GraphQL global IDs for a service instance.
 * Used for types (like SeoServiceInstance) that bypass the ServiceInstance field resolvers.
 */
export const withServiceInstanceGlobalIDs = <
  T extends Pick<
    ServiceInstance,
    'logo_document_id' | 'illustration_document_id'
  >,
>(
  service: T
): T => ({
  ...service,
  ...(service.illustration_document_id && {
    illustration_document_id: toGlobalId(
      'Document',
      service.illustration_document_id
    ),
  }),
  ...(service.logo_document_id && {
    logo_document_id: toGlobalId('Document', service.logo_document_id),
  }),
});
