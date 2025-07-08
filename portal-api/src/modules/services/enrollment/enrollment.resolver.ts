import { fromGlobalId } from 'graphql-relay/node/node.js';
import { z } from 'zod/v4';
import { Resolvers } from '../../../__generated__/resolvers-types';
import { logApp } from '../../../utils/app-logger.util';
import { BadRequestError } from '../../../utils/error.util';
import { enrollmentApp } from './enrollment.app';

const resolvers: Resolvers = {
  Mutation: {
    enrollOCTIInstance: async (_, { input }, context) => {
      const schema = z.object({
        organizationId: z.uuid().nonempty(),
        platformId: z.uuid().nonempty(),
        platformUrl: z.string().nonempty(),
        platformTitle: z.string().nonempty(),
      });

      const payload = {
        ...input,
        organizationId: fromGlobalId(input.organizationId).id,
      };

      const result = schema.safeParse(payload);
      if (!result.success) {
        logApp.warn(result.error);
        throw BadRequestError('OCTI_ENROLLMENT_INVALID_DATA');
      }

      const token = await enrollmentApp.enrollOCTIInstance(context, payload);
      return { token };
    },
  },
};

export default resolvers;
