import {
  IntegrationType,
  Resolvers,
} from '../../../__generated__/resolvers-types';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import { listen } from '../../../pub';
import { ErrorCode, UnknownErrorCode } from '../../../utils/error/error.code';
import { mapToGraphQLError } from '../../../utils/error/error.mapping';
import { NotFoundError } from '../../../utils/error/error.util';
import { createRelayIdScalar } from '../../../utils/scalar.util';
import { loadCapabilities } from '../../security-management/user-service-capability/user-service-capability.helper';
import { OPENAEV_SCENARIO_DOCUMENT_TYPE } from '../../shareable-resource/openaev/scenario/scenario.model';
import { OPENCTI_CUSTOM_DASHBOARD_DOCUMENT_TYPE } from '../../shareable-resource/opencti/custom-dashboard/custom-dashboard.model';
import { OPENCTI_INTEGRATION_DOCUMENT_TYPE } from '../../shareable-resource/opencti/integration/integration.model';
import { ServiceInstanceApp } from './service-instance.app';
import {
  getUserJoined,
  loadIsSubscribed,
  loadLinks,
  loadServiceDefinitionByServiceInstance,
  loadServiceInstances,
  loadServiceInstanceSubscriptions,
} from './service-instance.domain';

const resolvers: Resolvers = {
  ServiceInstanceId: createRelayIdScalar<ServiceInstanceId>('ServiceInstance'),
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
    serviceInstanceLinksByTags: async (_, { tags }) => {
      return ServiceInstanceApp.loadLinkServiceInstancesByTags(tags);
    },
    serviceInstanceById: async (_, { service_instance_id }, context) => {
      return ServiceInstanceApp.loadServiceInstanceAndGrantAccess(
        context.user,
        service_instance_id
      );
    },
    seoServiceInstances: async () => {
      return ServiceInstanceApp.loadSeoServiceInstances();
    },
    seoServiceInstance: async (_, { slug }) => {
      try {
        return await ServiceInstanceApp.loadSeoServiceInstance(slug);
      } catch (error) {
        if (error.message === ErrorCode.ServiceNotFound) {
          throw NotFoundError(ErrorCode.ServiceNotFound, { slug });
        }

        throw mapToGraphQLError(error);
      }
    },
  },
  Mutation: {
    addServicePicture: async (_, input) => {
      try {
        return await ServiceInstanceApp.addServicePicture(
          input.serviceInstanceId,
          input.document,
          input.isLogo
        );
      } catch (error) {
        throw mapToGraphQLError(error);
      }
    },
    updatePlatformServiceMetadata: async (_, { input, document }, context) => {
      try {
        return await ServiceInstanceApp.updatePlatformServiceMetadata(
          context.user,
          input.serviceInstanceId,
          input,
          document
        );
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
      subscribe: (_, __, context) => listen(context, ['ServiceInstance']),
    },
  },
};

export default resolvers;
