import { toGlobalId } from 'graphql-relay/node/node.js';
import {
  DeploymentAvailability,
  DeploymentRequestConnection,
  QueryDeploymentRequestsArgs,
  QueryDeploymentRequestsListArgs,
  Resolvers,
} from '../../__generated__/resolvers-types';
import { DeploymentRequestId } from '../../model/kanel/public/DeploymentRequest';
import { UnknownErrorCode } from '../../utils/error/error.code';
import { mapToGraphQLError } from '../../utils/error/error.mapping';
import { extractId } from '../../utils/utils';
import { DeploymentApp } from './deployment.app';
import { DeploymentRequestDomain } from './deployment.domain';

const resolvers: Resolvers = {
  DeploymentRequest: {
    service_instance_id: ({ service_instance_id }) => {
      if (service_instance_id) {
        return toGlobalId('ServiceInstance', service_instance_id);
      }
    },
    organization_requester_id: ({ organization_requester_id }) => {
      if (organization_requester_id) {
        return toGlobalId('Organization', organization_requester_id);
      }
    },
  },
  Query: {
    deploymentRequests: async (_, args: QueryDeploymentRequestsArgs) => {
      try {
        return await DeploymentApp.loadPlatformDeploymentRequests(args);
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
        return await DeploymentApp.loadAvailableDeploymentRequests(
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
    trialDeployments: async (_, { input }) => {
      try {
        return await DeploymentApp.loadTrialDeployments(input);
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
        return await DeploymentApp.createDeploymentRequest(input);
      } catch (error) {
        throw mapToGraphQLError(
          error,
          UnknownErrorCode.CreateDeploymentRequestError
        );
      }
    },
    updateDeploymentRequest: async (_, { input }) => {
      try {
        return await DeploymentApp.updateDeploymentRequest(input);
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
        return await DeploymentApp.cancelDeploymentRequest(
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
        return await DeploymentApp.cancelDeploymentRequest(
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
        return await DeploymentApp.reorderDeploymentRequestInQueue({
          ...input,
          id: extractId<DeploymentRequestId>(input.id),
        });
      } catch (error) {
        throw mapToGraphQLError(error);
      }
    },

    updateDeploymentQuotaCapacity: async (_, { input }) => {
      try {
        return await DeploymentApp.updateDeploymentQuotaCapacity(input);
      } catch (error) {
        throw mapToGraphQLError(error);
      }
    },
  },
};

export default resolvers;
