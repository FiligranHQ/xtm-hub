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
    isOpenCTIPlatformRegistered: async (_, { input }, context) => {
      try {
        const response = await registrationApp.isOpenCTIPlatformRegistered(
          context,
          input
        );
        return response;
      } catch (error) {
        switch (error.message) {
          case ErrorCode.SubscriptionNotFound:
            throw NotFoundError(error.message);
        }

        throw UnknownError(ErrorCode.IsOpenCTIPlatformRegisteredUnknownError, {
          detail: error.message,
        });
      }
    },

    canUnregisterOpenCTIPlatform: async (_, { input }, context) => {
      try {
        const response = await registrationApp.canUnregisterOpenCTIPlatform(
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
        throw UnknownError(ErrorCode.CanUnregisterOpenCTIPlatformUnknownError, {
          detail: error,
        });
      }
    },
    openCTIPlatforms: async (_, _z, context) =>
      registrationApp.loadOpenCTIPlatforms(context),
    openCTIPlatformRegistrationStatus: async (_, { input }, context) =>
      registrationApp.loadOpenCTIPlatformRegistrationStatus(context, input),
  },
  Mutation: {
    registerOpenCTIPlatform: async (_, { input }, context) => {
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
        const token = await registrationApp.registerOpenCTIPlatform(
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

        throw UnknownError(ErrorCode.RegisterOpenCTIPlatformUnknownError, {
          detail: error,
        });
      }
    },
    unregisterOpenCTIPlatform: async (_, { input }, context) => {
      const trx = await dbTx();
      try {
        await registrationApp.unregisterOpenCTIPlatform(
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

        throw UnknownError(ErrorCode.UnregisterOpenCTIPlatformUnknownError, {
          detail: error,
        });
      }
    },
  },
};

export default resolvers;
