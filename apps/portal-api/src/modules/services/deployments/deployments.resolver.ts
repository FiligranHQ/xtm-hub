import {
  DeploymentAvailability,
  DeploymentRequestConnection,
  QueryDeploymentRequestsArgs,
  QueryDeploymentRequestsListArgs,
  Resolvers,
} from '../../../__generated__/resolvers-types';
import { DeploymentRequestId } from '../../../model/kanel/public/DeploymentRequest';
import { UnknownErrorCode } from '../../../utils/error/error.code';
import { mapToGraphQLError } from '../../../utils/error/error.mapping';
import { extractId } from '../../../utils/utils';
import { DeploymentsApp } from './deployments.app';
import { DeploymentRequestDomain } from './deployments.domain';

const resolvers: Resolvers = {
  Query: {
    deploymentRequests: async (_, args: QueryDeploymentRequestsArgs) => {
      try {
        return await DeploymentsApp.loadPlatformDeploymentRequests(args);
      } catch (error) {
        throw mapToGraphQLError(
          error,
          UnknownErrorCode.DeploymentRequestUnknownError
        );
      }
    },
    deploymentRequestsAvailable: async (
      _,
      { platformIdentifier }
    ): Promise<DeploymentAvailability[]> => {
      try {
        return await DeploymentsApp.loadAvailableDeploymentRequests(
          platformIdentifier
        );
      } catch (error) {
        throw mapToGraphQLError(
          error,
          UnknownErrorCode.DeploymentRequestUnknownError
        );
      }
    },
    deploymentRequestsList: async (
      _,
      args: QueryDeploymentRequestsListArgs
    ) => {
      try {
        return await DeploymentRequestDomain.loadDeploymentRequests<DeploymentRequestConnection>(
          args
        );
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
    cancelDeploymentRequest: async (
      _,
      { deploymentRequestId, cancellationReason }
    ) => {
      try {
        return await DeploymentsApp.cancelDeploymentRequest(
          extractId<DeploymentRequestId>(deploymentRequestId),
          false,
          cancellationReason
        );
      } catch (error) {
        throw mapToGraphQLError(
          error,
          UnknownErrorCode.DeploymentRequestUnknownError
        );
      }
    },
    adminCancelDeploymentRequest: async (_, { deploymentRequestId }) => {
      try {
        return await DeploymentsApp.cancelDeploymentRequest(
          extractId<DeploymentRequestId>(deploymentRequestId),
          true
        );
      } catch (error) {
        throw mapToGraphQLError(
          error,
          UnknownErrorCode.DeploymentRequestUnknownError
        );
      }
    },

    reorderDeploymentRequestInQueue: async (_, { input }) => {
      try {
        return await DeploymentsApp.reorderDeploymentRequestInQueue({
          ...input,
          id: extractId<DeploymentRequestId>(input.id),
        });
      } catch (error) {
        throw mapToGraphQLError(error);
      }
    },

    updateDeploymentQuotaCapacity: async (_, { input }) => {
      try {
        return await DeploymentsApp.updateDeploymentQuotaCapacity(input);
      } catch (error) {
        throw mapToGraphQLError(error);
      }
    },
  },
};

export default resolvers;
