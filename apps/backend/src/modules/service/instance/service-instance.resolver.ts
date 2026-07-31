import { Resolvers } from '../../../__generated__/resolvers-types';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import { listen } from '../../../pub';
import { getErrorMessage } from '../../../utils/error/error-guard.util';
import { ErrorCode, UnknownErrorCode } from '../../../utils/error/error.code';
import { mapToGraphQLError } from '../../../utils/error/error.mapping';
import { NotFoundError } from '../../../utils/error/error.util';
import { createRelayIdScalar } from '../../../utils/scalar.util';
import { UserServiceCapabilityHelper } from '../../security-management/user-service-capability/user-service-capability.helper';
import { ServiceInstanceApp } from './service-instance.app';
import { ServiceInstanceDomain } from './service-instance.domain';

const resolvers: Resolvers = {
  ServiceInstanceId: createRelayIdScalar<ServiceInstanceId>('ServiceInstance'),
  ServiceInstance: {
    links: ({ id }, _) =>
      ServiceInstanceDomain.loadLinks(id as ServiceInstanceId),
    service_definition: ({ id }, _) =>
      ServiceInstanceDomain.loadServiceDefinitionByServiceInstance(
        id as ServiceInstanceId
      ),
    organization_subscribed: ({ id }, _, context) =>
      ServiceInstanceDomain.loadIsSubscribed(
        context.user.selected_organization_id,
        id as ServiceInstanceId
      ),
    capabilities: ({ id }, _, context) =>
      UserServiceCapabilityHelper.loadCapabilities(
        id as ServiceInstanceId,
        context.user.id,
        context.user.selected_organization_id
      ),
    user_joined: ({ id }, _, context) =>
      ServiceInstanceDomain.getUserJoined(
        context.user.id,
        context.user.selected_organization_id,
        id as ServiceInstanceId
      ),
    subscriptions: ({ id }, _) =>
      ServiceInstanceDomain.loadServiceInstanceSubscriptions(
        id as ServiceInstanceId
      ),
  },
  Query: {
    serviceInstances: async (_, opt) => {
      return ServiceInstanceDomain.loadServiceInstances(opt);
    },
    serviceInstanceLinksByTags: async (_, { tags }) => {
      return ServiceInstanceApp.loadLinkServiceInstancesByTags(tags);
    },
    serviceInstanceByIdAndGrantAccess: async (_, { service_instance_id }) => {
      return ServiceInstanceApp.loadServiceInstanceAndGrantAccess(
        service_instance_id
      );
    },
    serviceInstanceById: async (_, { service_instance_id }) => {
      return ServiceInstanceApp.loadServiceInstance(service_instance_id);
    },
    seoServiceInstances: async () => {
      return ServiceInstanceApp.loadSeoServiceInstances();
    },
    seoServiceInstance: async (_, { slug }) => {
      try {
        return await ServiceInstanceApp.loadSeoServiceInstance(slug);
      } catch (error) {
        if (getErrorMessage(error) === ErrorCode.ServiceNotFound) {
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
