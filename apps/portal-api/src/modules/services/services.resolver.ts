import { toGlobalId } from 'graphql-relay/node/node.js';
import { db } from '../../../knexfile';
import {
  IntegrationType,
  RegisteredPlatform,
  Resolvers,
  SeoServiceInstance,
  ServiceInstance,
  ServiceInstanceTag,
} from '../../__generated__/resolvers-types';
import { withTransaction } from '../../context/database.context';
import { ServiceInstanceId } from '../../model/kanel/public/ServiceInstance';
import { dispatch, listen } from '../../pub';
import { ErrorCode, UnknownErrorCode } from '../../utils/error/error.code';
import { mapToGraphQLError } from '../../utils/error/error.mapping';
import { NotFoundError } from '../../utils/error/error.util';
import { extractId } from '../../utils/utils';
import { loadCapabilities } from '../user_service/user-service-capability/user-service-capability.helper';
import { OPENCTI_CUSTOM_DASHBOARD_DOCUMENT_TYPE } from './custom-dashboards/custom-dashboards.domain';
import { uploadNewFile } from './document/document.helper';
import { OPENCTI_INTEGRATION_DOCUMENT_TYPE } from './integrations/integrations.model';
import { OPENAEV_SCENARIO_DOCUMENT_TYPE } from './openaev-scenarios/openaev-scenarios.domain';
import { PlatformConfiguration } from './registration/registration.domain';
import { serviceInstanceApp } from './service-instance.app';
import {
  getUserJoined,
  loadIsSubscribed,
  loadLinks,
  loadPlatformConfigurationByServiceInstanceId,
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
    __resolveType(service_instance) {
      const integrationMapping = {
        [IntegrationType.Connector]: 'Connector',
        [IntegrationType.CsvFeed]: 'CsvFeed',
      };
      const typeMapping = {
        [OPENAEV_SCENARIO_DOCUMENT_TYPE]: 'OpenAEVScenario',
        [OPENCTI_CUSTOM_DASHBOARD_DOCUMENT_TYPE]: 'OpenCTICustomDashboard',
        [OPENCTI_INTEGRATION_DOCUMENT_TYPE]: 'OpenCTIIntegration',
      };

      if (service_instance.type === OPENCTI_INTEGRATION_DOCUMENT_TYPE) {
        return (
          integrationMapping[service_instance.integration_type] ??
          typeMapping[service_instance.type]
        );
      }
      return typeMapping[service_instance.type] ?? 'SeoServiceInstance';
    },
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
    links: ({ id }, _) => loadLinks(id),
    service_definition: ({ id }, _) =>
      loadServiceDefinitionByServiceInstance(id),
    organization_subscribed: ({ id }, _, context) =>
      loadIsSubscribed(
        context.user.selected_organization_id,
        id as ServiceInstanceId
      ),
    capabilities: ({ id }, _, context) =>
      loadCapabilities(
        id,
        context.user.id,
        context.user.selected_organization_id
      ),
    user_joined: ({ id }, _, context) =>
      getUserJoined(
        context.user.id,
        context.user.selected_organization_id,
        id as ServiceInstanceId
      ),
    subscriptions: ({ id }, _) =>
      loadServiceInstanceSubscriptions(id as ServiceInstanceId),
  },
  Query: {
    serviceInstances: async (_, opt) => {
      return loadServiceInstances(opt);
    },
    publicServiceInstances: async (_, opt, context) => {
      return loadPublicServiceInstances(
        context.user.id,
        context.user.selected_organization_id,
        opt
      );
    },
    serviceInstanceLinksByTags: async (_, { tags }) => {
      const services =
        await serviceInstanceApp.loadLinkServiceInstancesByTags(tags);
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
    serviceInstanceById: async (_, { service_instance_id }, context) => {
      const serviceInstance = await serviceInstanceApp.loadServiceInstance(
        context.user,
        extractId<ServiceInstanceId>(service_instance_id)
      );

      return serviceInstance;
    },
    serviceInstanceByIdWithSubscriptions: async (
      _,
      { service_instance_id, searchTerm }
    ) => {
      return loadServiceWithSubscriptions(
        extractId(service_instance_id),
        searchTerm
      );
    },
    subscribedServiceInstancesByIdentifier: async (
      _,
      { identifier },
      context
    ) => {
      return loadSubscribedServiceInstancesByIdentifier(
        context.user.id,
        identifier
      );
    },
    seoServiceInstances: async (_, _opt) => {
      const services = await loadSeoServiceInstances();
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
    seoServiceInstance: async (_, { slug }) => {
      const serviceInstance = await loadSeoServiceInstanceBySlug(slug);
      if (!serviceInstance) {
        throw NotFoundError(ErrorCode.ServiceNotFound, {
          slug,
        });
      }
      const result: SeoServiceInstance = {
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
        tags: serviceInstance.tags as ServiceInstanceTag[],
      };
      return result;
    },
  },
  Mutation: {
    addServicePicture: async (_, payload) => {
      try {
        const extractedServiceInstanceId = extractId<ServiceInstanceId>(
          payload.serviceInstanceId
        );
        const updatedServiceInstance = await withTransaction(async () => {
          const document = await uploadNewFile(
            payload.document,
            extractedServiceInstanceId
          );
          const update = payload.isLogo
            ? {
                logo_document_id: document.id,
              }
            : {
                illustration_document_id: document.id,
              };
          const [updatedServiceInstance] = await db<ServiceInstance>(
            'ServiceInstance'
          )
            .where({
              id: extractedServiceInstanceId,
            })
            .update(update)
            .returning('*');
          return updatedServiceInstance;
        });
        await dispatch('ServiceInstance', 'edit', updatedServiceInstance);
        return updatedServiceInstance;
      } catch (error) {
        throw mapToGraphQLError(error);
      }
    },
    updatePlatformServiceMetadata: async (_, { input, document }) => {
      try {
        const updatedServiceInstance =
          await serviceInstanceApp.updatePlatformServiceMetadata(
            input,
            document
          );

        await dispatch('ServiceInstance', 'edit', updatedServiceInstance);

        // Get platform configuration to return RegisteredPlatform
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
        console.error(error);
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
