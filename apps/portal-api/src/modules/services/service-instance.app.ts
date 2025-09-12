import { Knex } from 'knex';
import {
  ServiceInstance,
  UpdatePlatformServiceMetadataInput,
} from '../../__generated__/resolvers-types';
import { ServiceInstanceId } from '../../model/kanel/public/ServiceInstance';
import { PortalContext } from '../../model/portal-context';
import { securityGuard } from '../../security/guard';
import { NotFoundError } from '../../utils/error.util';
import { extractId } from '../../utils/utils';
import { loadSubscriptionBy } from '../subcription/subscription.domain';
import { GenericServiceCapabilityIds } from '../user_service/service-capability/generic_service_capability.const';
import { loadUserServiceBy } from '../user_service/user_service.domain';
import { uploadNewFile } from './document/document.helper';
import {
  grantServiceAccess,
  loadServiceDefinitionByServiceInstance,
  loadServiceInstanceBy,
} from './service-instance.domain';

export const serviceInstanceApp = {
  loadServiceInstance: async (
    context: PortalContext,
    serviceInstanceId: ServiceInstanceId
  ): Promise<ServiceInstance> => {
    const subscription = await loadSubscriptionBy(context, {
      service_instance_id: serviceInstanceId,
    });
    const userService = await loadUserServiceBy(context, {
      subscription_id: subscription.id,
      user_id: context.user.id,
    });
    if (userService.length === 0) {
      console.warn('USER_MUST_JOIN_SERVICE_BEFORE_ACCESSING_IT');
      if (subscription.joining === 'AUTO_JOIN') {
        await grantServiceAccess(
          context,
          [GenericServiceCapabilityIds.AccessId],
          [context.user.id],
          subscription.id
        );
      }
    }
    return loadServiceInstanceBy(context, 'id', serviceInstanceId);
  },

  updatePlatformServiceMetadata: async (
    context: PortalContext,
    input: UpdatePlatformServiceMetadataInput,
    trx: Knex.Transaction
  ): Promise<ServiceInstance> => {
    // Get service instance to verify type
    const serviceInstance = await serviceInstanceApp.loadServiceInstance(
      context,
      extractId<ServiceInstanceId>(input.serviceInstanceId)
    );

    if (!serviceInstance) {
      throw NotFoundError('SERVICE_INSTANCE_NOT_FOUND');
    }

    // Get service definition
    const serviceDefinition = await loadServiceDefinitionByServiceInstance(
      context,
      serviceInstance.id
    );

    if (!serviceDefinition) {
      throw NotFoundError('SERVICE_DEFINITION_NOT_FOUND');
    }

    // Verify platform type and check capabilities
    await securityGuard.assertUserCanModifyPlatformService(
      context,
      serviceDefinition
    );

    // Build update object
    const updateData: Partial<ServiceInstance> = {};

    // Update name if provided
    if (input.name) {
      updateData.name = input.name;
    }

    // Handle illustration image upload if provided
    if (input.document) {
      const document = await uploadNewFile(context, input.document, trx);
      updateData.illustration_document_id = document.id;
    }

    // Perform update
    const { db } = await import('../../../knexfile');
    const [updatedServiceInstance] = await db<ServiceInstance>(
      context,
      'ServiceInstance'
    )
      .where({
        id: extractId<ServiceInstanceId>(input.serviceInstanceId),
      })
      .update(updateData)
      .returning('*')
      .transacting(trx);

    return updatedServiceInstance;
  },
};
