import { Resolvers } from '../../../__generated__/resolvers-types';
import { mapToGraphQLError } from '../../../utils/error/error.mapping';
import { ServiceGroupApp } from './service-group.app';

const resolvers: Resolvers = {
  Query: {
    bundleUserServiceGroups: async (_, { serviceInstanceId }) => {
      try {
        return await ServiceGroupApp.loadBundleUserServiceGroups(
          serviceInstanceId
        );
      } catch (error) {
        throw mapToGraphQLError(error);
      }
    },
    bundleProducts: async (_, { serviceInstanceId }) => {
      try {
        return await ServiceGroupApp.loadBundleProducts(serviceInstanceId);
      } catch (error) {
        throw mapToGraphQLError(error);
      }
    },
  },
  Mutation: {
    addUsersToBundleGroups: async (_, { serviceInstanceId, input }) => {
      try {
        return await ServiceGroupApp.addUsersToBundleGroups(
          serviceInstanceId,
          input
        );
      } catch (error) {
        throw mapToGraphQLError(error);
      }
    },
    removeUsersFromBundleGroups: async (_, { serviceInstanceId, userIds }) => {
      try {
        return await ServiceGroupApp.removeUsersFromBundleGroups(
          serviceInstanceId,
          userIds
        );
      } catch (error) {
        throw mapToGraphQLError(error);
      }
    },
    updateBundleUserGroups: async (_, { serviceInstanceId, input }) => {
      try {
        return await ServiceGroupApp.updateBundleUserGroups(
          serviceInstanceId,
          input
        );
      } catch (error) {
        throw mapToGraphQLError(error);
      }
    },
  },
};

export default resolvers;
