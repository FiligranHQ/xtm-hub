import { fromGlobalId, toGlobalId } from 'graphql-relay/node/node.js';
import {
  AutoRegisterPlatformInput,
  Resolvers,
} from '../../../__generated__/resolvers-types';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import { PortalContext } from '../../../model/portal-context';
import {
  BadRequestErrorCode,
  ErrorCode,
  UnknownErrorCode,
} from '../../../utils/error/error.code';
import { mapToGraphQLError } from '../../../utils/error/error.mapping';
import { BadRequestError } from '../../../utils/error/error.util';
import { extractId } from '../../../utils/utils';
import { DeploymentRequestDomain } from '../deployments/deployments.domain';
import { loadServiceInstanceSubscription } from '../service-instance.domain';
import { registrationApp } from './registration.app';

const resolvers: Resolvers = {
  RegisteredPlatform: {
    subscription: ({ id }, _, context) =>
      loadServiceInstanceSubscription(
        context.user.selected_organization_id,
        id as ServiceInstanceId
      ),
    deployment_request: ({ id }, _, __) =>
      DeploymentRequestDomain.loadDeploymentRequestBy({
        service_instance_id: id as ServiceInstanceId,
      }),
  },
  Query: {
    isPlatformRegistered: async (_, { input }) => {
      try {
        const response = await registrationApp.isPlatformRegistered(input);
        return response;
      } catch (error) {
        throw mapToGraphQLError(
          error,
          UnknownErrorCode.IsPlatformRegisteredUnknownError
        );
      }
    },
    canUnregisterPlatform: async (_, { input }) => {
      try {
        const response = await registrationApp.canUnregisterPlatform(input);

        return {
          ...response,
          isPlatformRegistered: true,
          organizationId: response.organizationId
            ? toGlobalId('Organization', response.organizationId)
            : undefined,
        };
      } catch (error) {
        if (ErrorCode.PlatformNotRegistered) {
          return {
            isPlatformRegistered: false,
          };
        }

        throw mapToGraphQLError(
          error,
          UnknownErrorCode.CanUnregisterPlatformUnknownError
        );
      }
    },
    registeredPlatform: async (_, { input }) =>
      registrationApp.loadRegisteredPlatform(
        extractId<ServiceInstanceId>(input.service_instance_id)
      ),
    registeredPlatforms: async (_, { input }) =>
      registrationApp.loadRegisteredPlatforms(input),
    /**
     * @deprecated Use `refreshPlatformRegistrationConnectivityStatus` instead.
     * This function is no longer used in the OpenCTI platform due to refactoring and the addition of a version value in the new endpoint.
     */
    openCTIPlatformRegistrationStatus: async (_, { input }) =>
      registrationApp.loadPlatformRegistrationStatus(input),
    platformAssociatedOrganization: async (_, { platformId }) => {
      try {
        return await registrationApp.loadPlatformAssociatedOrganization(
          platformId
        );
      } catch (error) {
        throw mapToGraphQLError(error);
      }
    },
  },
  Mutation: {
    registerPlatform: async (_, { input }) => {
      try {
        const payload = {
          ...input,
          organizationId: fromGlobalId(input.organizationId).id,
        };
        const token = await registrationApp.registerPlatform(payload);
        return { token };
      } catch (error) {
        throw mapToGraphQLError(
          error,
          UnknownErrorCode.RegisterPlatformUnknownError
        );
      }
    },
    unregisterPlatform: async (_, { input }) => {
      try {
        await registrationApp.unregisterPlatform(input);
        return { success: true };
      } catch (error) {
        throw mapToGraphQLError(
          error,
          UnknownErrorCode.UnregisterPlatformUnknownError
        );
      }
    },
    refreshUserPlatformToken: async (_, __, context) => {
      try {
        return await registrationApp.refreshUserPlatformToken(context.user.id);
      } catch (error) {
        throw mapToGraphQLError(
          error,
          UnknownErrorCode.RefreshUserPlatformTokenUnknownError
        );
      }
    },
    refreshPlatformRegistrationConnectivityStatus: async (_, { input }) =>
      registrationApp.refreshPlatformRegistrationConnectivityStatus(input),
    autoRegisterPlatform: async (
      _,
      { platform, input },
      context: PortalContext
    ) => {
      // TODO: Simplify code and remove deprecated input and tests once all trials use the new input type.
      const resolvedInput: AutoRegisterPlatformInput | null =
        input ?? (platform ? { platform } : null);
      if (!resolvedInput) {
        throw BadRequestError(
          BadRequestErrorCode.MissingAutoRegisterPlatformArgument
        );
      }
      try {
        const token = context.req.header('XTM-Hub-Platform-Token');
        await registrationApp.autoRegisterPlatform(token, resolvedInput);
        return { success: true };
      } catch (error) {
        throw mapToGraphQLError(
          error,
          UnknownErrorCode.RegisterPlatformUnknownError
        );
      }
    },
  },
};

export default resolvers;
