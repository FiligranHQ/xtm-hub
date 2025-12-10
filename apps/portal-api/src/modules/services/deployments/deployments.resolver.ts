import {
  DeploymentAvailability,
  DeploymentRequestConnection,
  QueryDeploymentRequestsArgs,
  QueryDeploymentRequestsListArgs,
  Resolvers,
} from '../../../__generated__/resolvers-types';
import { requestContext } from '../../../context/request.context';
import { UnknownErrorCode } from '../../../utils/error/error.code';
import { mapToGraphQLError } from '../../../utils/error/error.mapping';
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

    organizationDeploymentRequest: async (
      _,
      { platformIdentifier, hubStatus, type }
    ) => {
      const { portalContext } = requestContext.require();
      try {
        return await DeploymentRequestDomain.loadDeploymentRequestBy({
          organization_requester_id:
            portalContext.user.selected_organization_id,
          platform_identifier: platformIdentifier,
          hub_status: hubStatus,
          type,
        });
      } catch (error) {
        throw mapToGraphQLError(error);
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
