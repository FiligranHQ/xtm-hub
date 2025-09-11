import { fromGlobalId, toGlobalId } from 'graphql-relay/node/node.js';
import { dbTx } from '../../../../knexfile';
import { Resolvers } from '../../../__generated__/resolvers-types';
import {
  BadRequestError,
  FORBIDDEN_ACCESS,
  ForbiddenAccess,
  NotFoundError,
  UnknownError,
} from '../../../utils/error.util';
import { ErrorCode } from '../../common/error-code';
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
        switch (error.message) {
          case ErrorCode.SubscriptionNotFound:
            throw NotFoundError(error.message);
        }

        throw UnknownError(ErrorCode.IsPlatformRegisteredUnknownError, {
          detail: error.message,
        });
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
        switch (error.message) {
          case ErrorCode.PlatformNotRegistered:
            return {
              isPlatformRegistered: false,
            };
        }
        throw UnknownError(ErrorCode.CanUnregisterPlatformUnknownError, {
          detail: error,
        });
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
        throw UnknownError(ErrorCode.UnknownError, { detail: error });
      }
    },
  },
  Mutation: {
    registerPlatform: async (_, { input }, context) => {
      const trx = await dbTx();
      try {
        const payload = {
          ...input,
          organizationId: fromGlobalId(input.organizationId).id,
        };
        const token = await registrationApp.registerPlatform(
          {
            ...context,
            trx,
          },
          payload
        );
        await trx.commit();
        return { token };
      } catch (error) {
        await trx.rollback();
        switch (error.message) {
          case ErrorCode.InvalidServiceConfiguration:
            throw BadRequestError(error.message);
          case ErrorCode.ServiceDefinitionNotFound:
          case ErrorCode.SubscriptionNotFound:
          case ErrorCode.ServiceContractNotFound:
            throw NotFoundError(error.message);
          case ErrorCode.MissingCapabilityOnOrganization:
          case ErrorCode.RegistrationOnAnotherOrganizationForbidden:
          case ErrorCode.UserIsNotInOrganization:
            throw ForbiddenAccess(error.message);
        }

        if (error.name.includes(FORBIDDEN_ACCESS)) {
          throw ForbiddenAccess(error.message);
        }

        throw UnknownError(ErrorCode.RegisterPlatformUnknownError, {
          detail: error,
        });
      }
    },
    unregisterPlatform: async (_, { input }, context) => {
      const trx = await dbTx();
      try {
        await registrationApp.unregisterPlatform(
          {
            ...context,
            trx,
          },
          input
        );
        await trx.commit();
        return { success: true };
      } catch (error) {
        await trx.rollback();

        const errorMapping = {
          [ErrorCode.SubscriptionNotFound]: NotFoundError,
          [ErrorCode.MissingCapabilityOnOrganization]: ForbiddenAccess,
          [ErrorCode.UserIsNotInOrganization]: ForbiddenAccess,
        };

        const customError = errorMapping[error.message];
        if (customError) {
          throw customError(error.message);
        }

        throw UnknownError(ErrorCode.UnregisterPlatformUnknownError, {
          detail: error,
        });
      }
    },
    refreshUserPlatformToken: async (_, __, context) => {
      try {
        return await registrationApp.refreshUserPlatformToken(context);
      } catch (error) {
        throw UnknownError(ErrorCode.RefreshUserPlatformTokenUnknownError, {
          detail: error,
        });
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
