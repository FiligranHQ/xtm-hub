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
import { GenericServiceCapabilityIds } from '../../security-management/service-capability/generic-service-capability.const';
import { subscriptionApp } from '../../subscription/subscription.app';
import { SubscriptionDomain } from '../../subscription/subscription.domain';
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
    if (!service) {
      throw new Error(ErrorCode.ServiceInstanceNotFound);
    }
    let subscription = await SubscriptionDomain.loadSubscriptionBy({
      service_instance_id: serviceInstanceId,
      organization_id: user.selected_organization_id,
    });

    if (!subscription) {
      const [createdSubscription] =
        await subscriptionApp.subscribeOrganizationsToService({
          organizationIds: [user.selected_organization_id],
          serviceInstanceId: serviceInstanceId,
          startDate: new Date(),
          endDate: null,
          capabilityIds: [],
        });
      if (!createdSubscription) {
        throw NotFoundError(ErrorCode.SubscriptionNotFound);
      }
      subscription = createdSubscription;
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
    return service as unknown as ServiceInstance;
  },

  loadServiceInstance: async (
    serviceInstanceId: ServiceInstanceId
  ): Promise<ServiceInstance> => {
    const service = await loadServiceInstanceBy({ id: serviceInstanceId });
    if (!service) {
      throw new Error(ErrorCode.ServiceInstanceNotFound);
    }
    return service as unknown as ServiceInstance;
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
      if (!uploadedDocument) {
        throw new Error(ErrorCode.DocumentFileMissing);
      }
      const update = isLogo
        ? { logo_document_id: uploadedDocument.id }
        : { illustration_document_id: uploadedDocument.id };
      return updateServiceInstance(serviceInstanceId, update);
    });

    if (!updatedServiceInstance) {
      throw new Error(ErrorCode.ServiceInstanceNotFound);
    }
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
      if (!document) {
        throw new Error(ErrorCode.DocumentFileMissing);
      }
      updateData.illustration_document_id = document.id;
    }

    const updatedServiceInstance = await withTransaction(async () => {
      // Update ServiceInstance if there are fields to update
      let result = serviceInstance;
      if (Object.keys(updateData).length > 0) {
        result = await updateServiceInstance(serviceInstance.id, updateData);
        if (!result) {
          throw new Error(ErrorCode.ServiceInstanceNotFound);
        }
      }

      // For registered platforms, also update the platform_title in platform configuration
      if (input.name) {
        await updatePlatformConfigurationByServiceInstanceId(
          serviceInstance.id,
          {
            platform_title: input.name,
          }
        );
      }
      return result;
    });

    await dispatch('ServiceInstance', 'edit', updatedServiceInstance);

    // Build RegisteredPlatform response
    const config = await loadPlatformConfigurationByServiceInstanceId(
      updatedServiceInstance.id
    );

    if (!config) {
      throw NotFoundError(ErrorCode.PlatformConfigurationNotFound);
    }

    return {
      __typename: 'RegisteredPlatform',
      id: updatedServiceInstance.id,
      platform_id: config.platform_id,
      title: config.platform_title,
      url: config.platform_url,
      contract: config.platform_contract,
      version: config.platform_version,
      identifier: serviceDefinition.identifier,
      illustration_document_id:
        updatedServiceInstance.illustration_document_id ?? null,
      last_connectivity_check: config.last_connectivity_check,
    };
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
