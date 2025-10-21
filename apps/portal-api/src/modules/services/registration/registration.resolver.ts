import { fromGlobalId, toGlobalId } from 'graphql-relay/node/node.js';
import { dbTx } from '../../../../knexfile';
import { Resolvers } from '../../../__generated__/resolvers-types';
import { requestContext } from '../../../requestContext';
import { ErrorCode, UnknownErrorCode } from '../../../utils/error/error.code';
import { mapToGraphQLError } from '../../../utils/error/error.mapping';
import { registrationApp } from './registration.app';

const resolvers: Resolvers = {
  Query: {
    isPlatformRegistered: async (_, { input }, context) => {
      try {
        const response = await registrationApp.isPlatformRegistered(
          context,
          input
        );
        return response;
      } catch (error) {
        throw mapToGraphQLError(
          error,
          UnknownErrorCode.IsPlatformRegisteredUnknownError
        );
      }
    },
    canUnregisterPlatform: async (_, { input }, context) => {
      try {
        const response = await registrationApp.canUnregisterPlatform(
          context,
          input
        );

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
    registeredPlatforms: async (_, { input }, context) =>
      registrationApp.loadRegisteredPlatforms(context, input),
    /**
     * @deprecated Use `refreshPlatformRegistrationConnectivityStatus` instead.
     * This function is no longer used in the OpenCTI platform due to refactoring and the addition of a version value in the new endpoint.
     */
    openCTIPlatformRegistrationStatus: async (_, { input }, context) =>
      registrationApp.loadPlatformRegistrationStatus(context, input),
    platformAssociatedOrganization: async (_, { platformId }, context) => {
      try {
        return await registrationApp.loadPlatformAssociatedOrganization(
          context,
          platformId
        );
      } catch (error) {
        throw mapToGraphQLError(error);
      }
    },
  },
  Mutation: {
    registerPlatform: async (_, { input }, context) => {
      const trx = await dbTx();
      requestContext.update({ trx });
      try {
        const payload = {
          ...input,
          organizationId: fromGlobalId(input.organizationId).id,
        };
        const token = await registrationApp.registerPlatform(context, payload);
        await trx.commit();
        return { token };
      } catch (error) {
        await trx.rollback();
        throw mapToGraphQLError(
          error,
          UnknownErrorCode.RegisterPlatformUnknownError
        );
      }
    },
    unregisterPlatform: async (_, { input }, context) => {
      const trx = await dbTx();
      requestContext.update({ trx });
      try {
        await registrationApp.unregisterPlatform(context, input);
        await trx.commit();
        return { success: true };
      } catch (error) {
        await trx.rollback();
        throw mapToGraphQLError(
          error,
          UnknownErrorCode.UnregisterPlatformUnknownError
        );
      }
    },
    refreshUserPlatformToken: async (_, __, context) => {
      try {
        return await registrationApp.refreshUserPlatformToken(context);
      } catch (error) {
        throw mapToGraphQLError(
          error,
          UnknownErrorCode.RefreshUserPlatformTokenUnknownError
        );
      }
    },
    refreshPlatformRegistrationConnectivityStatus: async (
      _,
      { input },
      context
    ) =>
      registrationApp.refreshPlatformRegistrationConnectivityStatus(
        context,
        input
      ),
  },
};

export default resolvers;
