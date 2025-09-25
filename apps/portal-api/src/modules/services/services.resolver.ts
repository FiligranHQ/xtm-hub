import { fromGlobalId, toGlobalId } from 'graphql-relay/node/node.js';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseType, db, dbTx } from '../../../knexfile';
import {
  RegisteredPlatform,
  Resolvers,
  SeoServiceInstance,
  ServiceInstance,
  ServiceInstanceCreationStatus,
  ServiceLink,
  Subscription,
} from '../../__generated__/resolvers-types';
import { OrganizationId } from '../../model/kanel/public/Organization';
import ServiceConfiguration from '../../model/kanel/public/ServiceConfiguration';
import { ServiceDefinitionId } from '../../model/kanel/public/ServiceDefinition';
import { ServiceInstanceId } from '../../model/kanel/public/ServiceInstance';
import { ServiceLinkId } from '../../model/kanel/public/ServiceLink';
import ServicePrice, {
  ServicePriceId,
} from '../../model/kanel/public/ServicePrice';
import { SubscriptionId } from '../../model/kanel/public/Subscription';
import { dispatch, listen } from '../../pub';
import { logApp } from '../../utils/app-logger.util';
import { ErrorCode, UnknownErrorCode } from '../../utils/error/error.code';
import { mapToGraphQLError } from '../../utils/error/error.mapping';
import { NotFoundError } from '../../utils/error/error.util';
import { extractId } from '../../utils/utils';
import { loadOrganizationBy } from '../organizations/organizations.domain';
import { loadCapabilities } from '../user_service/user-service-capability/user-service-capability.helper';
import { uploadNewFile } from './document/document.helper';
import { PlatformConfiguration } from './registration/registration.domain';
import { serviceInstanceApp } from './service-instance.app';
import {
  getUserJoined,
  loadIsSubscribed,
  loadLinks,
  loadPublicServiceInstances,
  loadSeoServiceInstanceBySlug,
  loadSeoServiceInstances,
  loadServiceDefinitionByServiceInstance,
  loadServiceInstances,
  loadServiceInstanceSubscriptions,
  loadServiceWithSubscriptions,
  loadSubscribedServiceInstancesByIdentifier,
} from './service-instance.domain';

const resolvers: Resolvers = {
  ServiceInstance: {
    logo_document_id: ({ logo_document_id }) => {
      if (logo_document_id) {
        return toGlobalId('Document', logo_document_id);
      }
    },
    illustration_document_id: ({ illustration_document_id }) => {
      if (illustration_document_id) {
        return toGlobalId('Document', illustration_document_id);
      }
    },
    links: ({ id }, _, context) => loadLinks(context, id),
    service_definition: ({ id }, _, context) =>
      loadServiceDefinitionByServiceInstance(context, id),
    organization_subscribed: ({ id }, _, context) =>
      loadIsSubscribed(context, id),
    capabilities: ({ id }, _, context) =>
      loadCapabilities(
        context,
        id,
        context.user.id,
        context.user.selected_organization_id
      ),
    user_joined: ({ id }, _, context) => getUserJoined(context, id),
    subscriptions: ({ id }, _, context) =>
      loadServiceInstanceSubscriptions(context, id),
  },
  Query: {
    serviceInstances: async (_, opt, context) => {
      return loadServiceInstances(context, opt);
    },
    publicServiceInstances: async (_, opt, context) => {
      return loadPublicServiceInstances(context, opt);
    },
    serviceInstanceById: async (_, { service_instance_id }, context) => {
      const serviceInstance = await serviceInstanceApp.loadServiceInstance(
        context,
        extractId<ServiceInstanceId>(service_instance_id)
      );

      return serviceInstance;
    },
    serviceInstanceByIdWithSubscriptions: async (
      _,
      { service_instance_id },
      context
    ) => {
      return loadServiceWithSubscriptions(
        context,
        extractId(service_instance_id)
      );
    },
    subscribedServiceInstancesByIdentifier: async (
      _,
      { identifier },
      context
    ) => {
      return loadSubscribedServiceInstancesByIdentifier(context, identifier);
    },
    seoServiceInstances: async (_, _opt, context) => {
      const services = await loadSeoServiceInstances(context);
      return services.map((service: SeoServiceInstance) => ({
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
      }));
    },
    seoServiceInstance: async (_, { slug }, context) => {
      const serviceInstance = await loadSeoServiceInstanceBySlug(context, slug);
      if (!serviceInstance) {
        throw NotFoundError(ErrorCode.ServiceNotFound);
      }
      return {
        ...serviceInstance,
        ...(serviceInstance.illustration_document_id && {
          illustration_document_id: toGlobalId(
            'Document',
            serviceInstance.illustration_document_id
          ),
        }),
        ...(serviceInstance.logo_document_id && {
          logo_document_id: toGlobalId(
            'Document',
            serviceInstance.logo_document_id
          ),
        }),
        __typename: 'SeoServiceInstance',
      } as SeoServiceInstance;
    },
  },
  Mutation: {
    deleteServiceInstance: async (_, { id }, context) => {
      const { id: databaseId } = fromGlobalId(id) as {
        type: DatabaseType;
        id: string;
      };
      const [deletedServiceInstance] = await db<ServiceInstance>(
        context,
        'ServiceInstance'
      )
        .where({ id: databaseId })
        .delete('*');
      await dispatch('ServiceInstance', 'delete', deletedServiceInstance);
      return deletedServiceInstance;
    },
    addServicePicture: async (_, payload, context) => {
      const trx = await dbTx();
      try {
        const document = await uploadNewFile(context, payload.document, trx);
        const update = payload.isLogo
          ? {
              logo_document_id: document.id,
            }
          : {
              illustration_document_id: document.id,
            };
        const [updatedServiceInstance] = await db<ServiceInstance>(
          context,
          'ServiceInstance'
        )
          .where({
            id: extractId<ServiceInstanceId>(payload.serviceInstanceId),
          })
          .update(update)
          .returning('*')
          .transacting(trx);
        await trx.commit();
        await dispatch('ServiceInstance', 'edit', updatedServiceInstance);
        return updatedServiceInstance;
      } catch (error) {
        await trx.rollback();
        throw mapToGraphQLError(error);
      }
    },
    editServiceInstance: async (_, { id, name }, context) => {
      const { id: databaseId } = fromGlobalId(id) as {
        type: DatabaseType;
        id: string;
      };
      const [updatedServiceInstance] = await db<ServiceInstance>(
        context,
        'ServiceInstance'
      )
        .where({ id: databaseId })
        .update({ name })
        .returning('*');
      await dispatch('ServiceInstance', 'edit', updatedServiceInstance);
      return updatedServiceInstance;
    },
    addServiceInstance: async (_, { input }, context) => {
      const trx = await dbTx();

      try {
        const dataService = {
          id: uuidv4(),
          name: input.service_instance_name,
          description: input.service_instance_description,
          creation_status: ServiceInstanceCreationStatus.Pending,
        };
        const [addedServiceInstance] = await db<ServiceInstance>(
          context,
          'ServiceInstance'
        )
          .insert(dataService)
          .returning('*');

        const dataServicePrice = {
          id: uuidv4() as unknown as ServicePriceId,
          service_definition_id:
            addedServiceInstance.id as unknown as ServiceDefinitionId,
          fee_type: input.fee_type,
          start_date: new Date(),
          price: input.price,
        };

        await db<ServicePrice>(context, 'Service_Price')
          .insert(dataServicePrice)
          .returning('*');

        const dataServiceLink = {
          id: uuidv4() as unknown as ServiceLinkId,
          service_instance_id:
            addedServiceInstance.id as unknown as ServiceInstanceId,
          url: input.url,
          name: input.service_instance_name,
        };

        await db<ServiceLink>(context, 'Service_Link')
          .insert(dataServiceLink)
          .returning('*');
        await dispatch('ServiceInstance', 'add', addedServiceInstance);

        const dataSubscription = {
          id: uuidv4() as unknown as SubscriptionId,
          organization_id: fromGlobalId(input.organization_id).id,
          service_instance_id: addedServiceInstance.id,
          start_date: new Date(),
          end_date: null,
          status: 'ACCEPTED',
        };

        const [addedSubscription] = await db<Subscription>(
          context,
          'Subscription'
        )
          .insert(dataSubscription)
          .returning('*');
        addedSubscription.organization = await loadOrganizationBy({
          id: fromGlobalId(input.organization_id).id as OrganizationId,
        });
        addedSubscription.service_instance = addedServiceInstance;
        await trx.commit();
        return addedSubscription;
      } catch (error) {
        await trx.rollback();
        logApp.error('Error while adding the new service.', error);
        throw mapToGraphQLError(error);
      }
    },
    updatePlatformServiceMetadata: async (_, { input, document }, context) => {
      try {
        const updatedServiceInstance =
          await serviceInstanceApp.updatePlatformServiceMetadata(
            context,
            input,
            document
          );

        await dispatch('ServiceInstance', 'edit', updatedServiceInstance);

        // Get platform configuration to return RegisteredPlatform
        const config: ServiceConfiguration = await db<ServiceConfiguration>(
          context,
          'Service_Configuration'
        )
          .where('service_instance_id', '=', updatedServiceInstance.id)
          .first();

        if (!config) {
          throw new Error('SERVICE_CONFIGURATION_NOT_FOUND');
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
          identifier: updatedServiceInstance.identifier,
          illustration_document_id:
            updatedServiceInstance.illustration_document_id
              ? toGlobalId(
                  'Document',
                  updatedServiceInstance.illustration_document_id
                )
              : null,
        } as RegisteredPlatform;
      } catch (error) {
        throw mapToGraphQLError(
          error,
          UnknownErrorCode.UpdatePlatformServiceMetadataError
        );
      }
    },
  },
  Subscription: {
    ServiceInstance: {
      subscribe: (_, __, context) => ({
        [Symbol.asyncIterator]: () => listen(context, ['ServiceInstance']),
      }),
    },
  },
};

export default resolvers;
