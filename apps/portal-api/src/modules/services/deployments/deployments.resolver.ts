import {
  QueryDeploymentRequestsArgs,
  Resolvers,
} from '../../../__generated__/resolvers-types';
import { UnknownErrorCode } from '../../../utils/error/error.code';
import { mapToGraphQLError } from '../../../utils/error/error.mapping';
import { DeploymentsApp } from './deployments.app';

const resolvers: Resolvers = {
  Query: {
    deploymentRequests: async (_, args: QueryDeploymentRequestsArgs) => {
      try {
        return await DeploymentsApp.loadDeploymentRequests(args);
      } catch (error) {
        throw mapToGraphQLError(
          error,
          UnknownErrorCode.DeploymentRequestUnknownError
        );
      }
    },
  },

  Mutation: {
    createDeploymentRequest: async (_, { input }) => {
      try {
        return await DeploymentsApp.createDeploymentRequest(input);
      } catch (error) {
        throw mapToGraphQLError(
          error,
          UnknownErrorCode.CreateDeploymentRequestError
        );
      }
    },
    updateDeploymentRequest: async (_, { input }) => {
      try {
        return await DeploymentsApp.updateDeploymentRequest(input);
      } catch (error) {
        throw mapToGraphQLError(
          error,
          UnknownErrorCode.DeploymentRequestUnknownError
        );
      }
    },
  },
};

export default resolvers;
