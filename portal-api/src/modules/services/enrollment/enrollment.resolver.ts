import { z } from 'zod/v4';
import { Resolvers } from '../../../__generated__/resolvers-types';
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

      const result = schema.safeParse(input);
      if (!result.success) {
        throw BadRequestError('OCTI_ENROLLMENT_INVALID_DATA');
      }

      const token = await enrollmentApp.enrollOCTIInstance(context, input);
      return token;
    },
  },
};

export default resolvers;
