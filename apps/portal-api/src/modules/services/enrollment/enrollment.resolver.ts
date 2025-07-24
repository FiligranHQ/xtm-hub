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
import { enrollmentApp } from './enrollment.app';

const resolvers: Resolvers = {
  Query: {
    canEnrollOCTIInstance: async (_, { input }, context) => {
      try {
        const response = await enrollmentApp.canEnrollOCTIInstance(context, {
          ...input,
          organizationId: fromGlobalId(input.organizationId).id,
        });

        return response;
      } catch (error) {
        if (error.message.includes(ErrorCode.SubscriptionNotFound)) {
          throw NotFoundError(error.message);
        }

        throw UnknownError(ErrorCode.CanEnrollOCTIInstanceUnknownError, {
          detail: error,
        });
      }
    },
    canUnenrollOCTIInstance: async (_, { input }, context) => {
      try {
        const response = await enrollmentApp.canUnenrollOCTIInstance(
          context,
          input
        );

        return {
          ...response,
          isInstanceEnrolled: true,
          organizationId: response.organizationId
            ? toGlobalId('Organization', response.organizationId)
            : undefined,
        };
      } catch (error) {
        switch (error.message) {
          case ErrorCode.InstanceNotEnrolled:
            return {
              isInstanceEnrolled: false,
            };
        }
        throw UnknownError(ErrorCode.CanUnenrollOCTIInstanceUnknownError, {
          detail: error,
        });
      }
    },
    octiInstances: async (_, _z, context) =>
      enrollmentApp.loadOctiInstances(context),
  },
  Mutation: {
    enrollOCTIInstance: async (_, { input }, context) => {
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
        throw BadRequestError(ErrorCode.EnrollOCITInstanceInvalidData);
      }

      const trx = await dbTx();
      try {
        const token = await enrollmentApp.enrollOCTIInstance(
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
          case ErrorCode.MissingCapabilityOnOriginOrganization:
            throw ForbiddenAccess(error.message);
        }

        if (error.name.includes(FORBIDDEN_ACCESS)) {
          throw ForbiddenAccess(error.message);
        }

        throw UnknownError(ErrorCode.EnrollOCTIInstanceUnknownError, {
          detail: error,
        });
      }
    },
    unenrollOCTIInstance: async (_, { input }, context) => {
      const trx = await dbTx();
      try {
        await enrollmentApp.unenrollOCTIInstance(
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
          case ErrorCode.MissingCapabilityOnOriginOrganization:
            throw ForbiddenAccess(error.message);
        }

        throw UnknownError(ErrorCode.UnenrollOCTIInstanceUnknownError, {
          detail: error,
        });
      }
    },
  },
};

export default resolvers;
