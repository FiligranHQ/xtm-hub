import { fromGlobalId, toGlobalId } from 'graphql-relay/node/node.js';
import { z } from 'zod/v4';
import { dbTx } from '../../../../knexfile';
import { Resolvers } from '../../../__generated__/resolvers-types';
import { logApp } from '../../../utils/app-logger.util';
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
    isOCTIPlatformRegistered: async (_, { input }, context) => {
      try {
        const response = await registrationApp.isOCTIPlatformRegistered(
          context,
          input
        );
        return response;
      } catch (error) {
        switch (error.message) {
          case ErrorCode.SubscriptionNotFound:
            throw NotFoundError(error.message);
        }

        throw UnknownError(ErrorCode.IsOCTIPlatformRegisteredUnknownError, {
          detail: error.message,
        });
      }
    },

    canUnregisterOCTIPlatform: async (_, { input }, context) => {
      try {
        const response = await registrationApp.canUnregisterOCTIPlatform(
          context,
          input
        );

        return {
          ...response,
          isPlatformEnrolled: true,
          organizationId: response.organizationId
            ? toGlobalId('Organization', response.organizationId)
            : undefined,
        };
      } catch (error) {
        switch (error.message) {
          case ErrorCode.PlatformNotRegistered:
            return {
              isPlatformEnrolled: false,
            };
        }
        throw UnknownError(ErrorCode.CanUnregisterOCTIPlatformUnknownError, {
          detail: error,
        });
      }
    },
    octiPlatforms: async (_, _z, context) =>
      registrationApp.loadOCTIPlatforms(context),
    octiPlatformRegistrationStatus: async (_, { input }, context) =>
      registrationApp.loadOCTIPlatformRegistrationStatus(context, input),
  },
  Mutation: {
    enrollOCTIPlatform: async (_, { input }, context) => {
      const schema = z.object({
        organizationId: z.uuid().nonempty(),
        platform: z.object({
          id: z.uuid().nonempty(),
          url: z.url().nonempty(),
          title: z.string().nonempty(),
          contract: z.string().nonempty(),
        }),
      });

      const payload = {
        ...input,
        organizationId: fromGlobalId(input.organizationId).id,
      };

      const result = schema.safeParse(payload);
      if (!result.success) {
        logApp.warn(result.error);
        throw BadRequestError(ErrorCode.RegisterOCITPlatformInvalidData);
      }

      const trx = await dbTx();
      try {
        const token = await registrationApp.enrollOCTIPlatform(
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

        throw UnknownError(ErrorCode.RegisterOCTIPlatformUnknownError, {
          detail: error,
        });
      }
    },
    unregisterOCTIPlatform: async (_, { input }, context) => {
      const trx = await dbTx();
      try {
        await registrationApp.unregisterOCTIPlatform(
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
        switch (error.message) {
          case ErrorCode.ServiceConfigurationNotFound:
          case ErrorCode.SubscriptionNotFound:
            throw NotFoundError(error.message);
          case ErrorCode.MissingCapabilityOnOrganization:
          case ErrorCode.UserIsNotInOrganization:
            throw ForbiddenAccess(error.message);
        }

        throw UnknownError(ErrorCode.UnregisterOCTIPlatformUnknownError, {
          detail: error,
        });
      }
    },
  },
};

export default resolvers;
