import { fromGlobalId } from 'graphql-relay/node/node.js';
import {
  RegisteredPlatform,
  SeoServiceInstance,
  ServiceDefinitionIdentifier,
  ServiceInstance,
  ServiceInstanceTag,
  UpdatePlatformServiceMetadataInput,
} from '../../__generated__/resolvers-types';
import { withTransaction } from '../../context/database.context';
import { requestContext } from '../../context/request.context';
import {
  ServiceInstanceId,
  ServiceInstanceMutator,
} from '../../model/kanel/public/ServiceInstance';
import { UserLoadUserBy } from '../../model/user';
import { securityGuard } from '../../security/guard';
import { ErrorCode } from '../../utils/error/error.code';
import { NotFoundError } from '../../utils/error/error.util';
import { loadSubscriptionBy } from '../subcription/subscription.domain';
import { GenericServiceCapabilityIds } from '../user_service/service-capability/generic_service_capability.const';
import { UserServiceDomain } from '../user_service/user_service.domain';
import { uploadNewFile } from './document/document.helper';
import { Upload } from './document/document.uploads.helper';
import { PlatformConfiguration } from './registration/registration.domain';
import {
  grantServiceAccess,
  loadPlatformConfigurationByServiceInstanceId,
  loadPlatformServiceInstance,
  loadServiceDefinitionByServiceInstance,
  loadServiceInstanceBy,
  ServiceInstanceDomain,
  updatePlatformConfigurationByServiceInstanceId,
  updateServiceInstance,
} from './service-instance.domain';

export const serviceInstanceApp = {
  loadServiceInstance: async (
    user: UserLoadUserBy,
    serviceInstanceId: ServiceInstanceId
  ): Promise<ServiceInstance> => {
    const subscription = await loadSubscriptionBy({
      service_instance_id: serviceInstanceId,
      organization_id: user.selected_organization_id,
    });
    const userService = await UserServiceDomain.loadUserServiceBy({
      subscription_id: subscription.id,
      user_id: user.id,
    });
    if (userService.length === 0) {
      console.warn('USER_MUST_JOIN_SERVICE_BEFORE_ACCESSING_IT');
      if (subscription.joining === 'AUTO_JOIN') {
        await grantServiceAccess(
          [GenericServiceCapabilityIds.AccessId],
          [user.id],
          subscription.id
        );
      }
    }
    return loadServiceInstanceBy('id', serviceInstanceId);
  },

  updatePlatformServiceMetadata: async (
    input: UpdatePlatformServiceMetadataInput,
    upload: Upload | null
  ): Promise<RegisteredPlatform> => {
    const { id } = fromGlobalId(input.serviceInstanceId);
    const { user } = requestContext.require();

    const serviceInstance = await loadPlatformServiceInstance(
      user.selected_organization_id,
      id
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
      let updatedServiceInstance = serviceInstance;
      if (Object.keys(updateData).length > 0) {
        updatedServiceInstance = await updateServiceInstance(
          serviceInstance.id,
          updateData
        );
      }

      // For registered platforms, also update the configuration JSON for platform_title
      if (input.name) {
        // Get current configuration
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
      return updatedServiceInstance;
    });

    return {
      ...updatedServiceInstance,
      identifier: serviceDefinition.identifier,
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
      ...serviceInstance,
      __typename: 'SeoServiceInstance',
    }));
  },
};
