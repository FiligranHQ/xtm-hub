import {
  RegisteredPlatform,
  SeoServiceInstance,
  ServiceDefinitionIdentifier,
  ServiceInstance,
  ServiceInstanceTag,
  UpdatePlatformServiceMetadataInput,
} from '../../../__generated__/resolvers-types';
import { withTransaction } from '../../../context/database.context';
import { requestContext } from '../../../context/request.context';
import {
  ServiceInstanceId,
  ServiceInstanceMutator,
} from '../../../model/kanel/public/ServiceInstance';
import { UserLoadUserBy } from '../../../model/user';
import { dispatch } from '../../../pub';
import { securityGuard } from '../../../security/guard';
import { ErrorCode } from '../../../utils/error/error.code';
import { NotFoundError } from '../../../utils/error/error.util';
import { DocumentHelper } from '../../document/document.helper';
import { Upload } from '../../document/document.uploads.helper';
import { PlatformConfiguration } from '../../registration/registration.domain';
import { GenericServiceCapabilityIds } from '../../security-management/service-capability/generic-service-capability.const';
import { subscriptionApp } from '../../subscription/subscription.app';
import { loadSubscriptionBy } from '../../subscription/subscription.domain';
import { UserServiceDomain } from '../../user-service/user-service.domain';
import {
  grantServiceAccess,
  loadPlatformConfigurationByServiceInstanceId,
  loadPlatformServiceInstance,
  loadSeoServiceInstanceBySlug,
  loadSeoServiceInstances,
  loadServiceDefinitionByServiceInstance,
  loadServiceInstanceBy,
  ServiceInstanceDomain,
  updatePlatformConfigurationByServiceInstanceId,
  updateServiceInstance,
} from './service-instance.domain';

export const ServiceInstanceApp = {
  loadServiceInstanceAndGrantAccess: async (
    serviceInstanceId: ServiceInstanceId
  ): Promise<ServiceInstance> => {
    const { user } = requestContext.require();

    const service = await loadServiceInstanceBy({ id: serviceInstanceId });
    let subscription = await loadSubscriptionBy({
      service_instance_id: serviceInstanceId,
      organization_id: user.selected_organization_id,
    });

    if (!subscription) {
      [subscription] = await subscriptionApp.subscribeOrganizationsToService({
        organizationIds: [user.selected_organization_id],
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
      await grantServiceAccess(
        [GenericServiceCapabilityIds.AccessId],
        [user.id],
        subscription.id
      );
    }
    return service;
  },

  loadServiceInstance: async (
    serviceInstanceId: ServiceInstanceId
  ): Promise<ServiceInstance> => {
    return loadServiceInstanceBy({ id: serviceInstanceId });
  },
  addServicePicture: async (
    serviceInstanceId: ServiceInstanceId,
    document: Upload,
    isLogo: boolean
  ): Promise<ServiceInstance> => {
    const updatedServiceInstance = await withTransaction(async () => {
      const uploadedDocument = await DocumentHelper.uploadNewFile(
        document,
        serviceInstanceId
      );
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
      const document = await DocumentHelper.uploadNewFile(
        upload,
        serviceInstance.id
      );
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
      illustration_document_id:
        updatedServiceInstance.illustration_document_id ?? null,
    } as RegisteredPlatform;
  },

  loadSeoServiceInstances: async (): Promise<SeoServiceInstance[]> => {
    return await loadSeoServiceInstances();
  },

  loadSeoServiceInstance: async (slug: string): Promise<SeoServiceInstance> => {
    const serviceInstance = await loadSeoServiceInstanceBySlug(slug);
    if (!serviceInstance) {
      throw Error(ErrorCode.ServiceNotFound);
    }
    return serviceInstance;
  },

  loadLinkServiceInstancesByTags: async (
    tags: ServiceInstanceTag[]
  ): Promise<SeoServiceInstance[]> => {
    return await ServiceInstanceDomain.loadServiceInstancesByServiceDefinitionAndTagsWithoutSubscription(
      ServiceDefinitionIdentifier.Link,
      tags
    );
  },
};
