import { fromGlobalId } from 'graphql-relay/node/node.js';
import { dbTx } from '../../../knexfile';
import {
  RegisteredPlatform,
  ServiceInstance,
  UpdatePlatformServiceMetadataInput,
} from '../../__generated__/resolvers-types';
import {
  ServiceInstanceId,
  ServiceInstanceMutator,
} from '../../model/kanel/public/ServiceInstance';
import { PortalContext } from '../../model/portal-context';
import { UserLoadUserBy } from '../../model/user';
import { securityGuard } from '../../security/guard';
import { ErrorCode } from '../../utils/error/error.code';
import { NotFoundError } from '../../utils/error/error.util';
import { loadSubscriptionBy } from '../subcription/subscription.domain';
import { GenericServiceCapabilityIds } from '../user_service/service-capability/generic_service_capability.const';
import { loadUserServiceBy } from '../user_service/user_service.domain';
import { uploadNewFile } from './document/document.helper';
import { Upload } from './document/document.uploads.helper';
import { PlatformConfiguration } from './registration/registration.domain';
import {
  grantServiceAccess,
  loadPlatformConfigurationByServiceInstanceId,
  loadPlatformServiceInstance,
  loadServiceDefinitionByServiceInstance,
  loadServiceInstanceBy,
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
    });
    const userService = await loadUserServiceBy({
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
    context: PortalContext,
    input: UpdatePlatformServiceMetadataInput,
    upload: Upload | null
  ): Promise<RegisteredPlatform> => {
    const trx = await dbTx();

    try {
      const { id } = fromGlobalId(input.serviceInstanceId);
      context.serviceInstanceId = input.serviceInstanceId;

      const serviceInstance = await loadPlatformServiceInstance(
        context.user.selected_organization_id,
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
        context.user,
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
        context.serviceInstanceId = serviceInstance.id;
        const document = await uploadNewFile(upload, trx);
        updateData.illustration_document_id = document.id;
      }

      // Update ServiceInstance if there are fields to update
      let updatedServiceInstance = serviceInstance;
      if (Object.keys(updateData).length > 0) {
        updatedServiceInstance = await updateServiceInstance(
          serviceInstance.id,
          updateData,
          trx
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
            config,
            trx
          );
        }
      }

      await trx.commit();

      return {
        ...updatedServiceInstance,
        identifier: serviceDefinition.identifier,
      };
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  },
};
