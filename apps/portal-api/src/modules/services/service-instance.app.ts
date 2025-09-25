import { fromGlobalId } from 'graphql-relay/node/node.js';
import { Knex } from 'knex';
import { db } from '../../../knexfile';
import {
  RegisteredPlatform,
  ServiceInstance,
  UpdatePlatformServiceMetadataInput,
} from '../../__generated__/resolvers-types';
import ServiceConfiguration from '../../model/kanel/public/ServiceConfiguration';
import { ServiceInstanceId } from '../../model/kanel/public/ServiceInstance';
import { PortalContext } from '../../model/portal-context';
import { securityGuard } from '../../security/guard';
import { NotFoundError } from '../../utils/error/error.util';
import { loadSubscriptionBy } from '../subcription/subscription.domain';
import { GenericServiceCapabilityIds } from '../user_service/service-capability/generic_service_capability.const';
import { loadUserServiceBy } from '../user_service/user_service.domain';
import { Upload, uploadNewFile } from './document/document.helper';
import { PlatformConfiguration } from './registration/registration.domain';
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
    upload: Upload,
    trx: Knex.Transaction
  ): Promise<RegisteredPlatform> => {
    const { id } = fromGlobalId(input.serviceInstanceId);
    context.serviceInstanceId = input.serviceInstanceId;

    const serviceInstance = await db<ServiceInstance>(
      context,
      'ServiceInstance'
    )
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
      .where('ServiceInstance.id', '=', id)
      .where(
        'Subscription.organization_id',
        '=',
        context.user.selected_organization_id
      )
      .whereIn('ServiceDefinition.identifier', [
        'opencti_registration',
        'openaev_registration',
      ])
      .select('ServiceInstance.*')
      .first();

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

    // Build update object for ServiceInstance
    const updateData: Partial<ServiceInstance> = {};

    // Update ServiceInstance name if provided
    if (input.name) {
      updateData.name = input.name;
    }

    // Handle illustration image upload if provided
    if (upload) {
      context.serviceInstanceId = serviceInstance.id;
      const document = await uploadNewFile(context, upload, trx);
      updateData.illustration_document_id = document.id;
    }

    // Update ServiceInstance if there are fields to update
    let updatedServiceInstance = serviceInstance;
    if (Object.keys(updateData).length > 0) {
      const [result] = await db<ServiceInstance>(context, 'ServiceInstance')
        .where({ id: serviceInstance.id })
        .update(updateData)
        .returning('*')
        .transacting(trx);
      updatedServiceInstance = result;
    }

    // For registered platforms, also update the configuration JSON for platform_title
    if (input.name) {
      // Get current configuration
      const currentConfig = await db<ServiceConfiguration>(
        context,
        'Service_Configuration'
      )
        .where('service_instance_id', '=', serviceInstance.id)
        .first()
        .transacting(trx);

      if (currentConfig) {
        const config = currentConfig.config as PlatformConfiguration;
        config.platform_title = input.name;

        await db<ServiceConfiguration>(context, 'Service_Configuration')
          .where('service_instance_id', '=', serviceInstance.id)
          .update({ config })
          .transacting(trx);
      }
    }

    return {
      ...updatedServiceInstance,
      identifier: serviceDefinition.identifier,
    };
  },
};
