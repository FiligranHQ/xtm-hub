import { Resolvers } from '../../../__generated__/resolvers-types';
import { ManifestFragmentDomain } from './manifest-fragment.domain';

const resolvers: Resolvers = {
  Mutation: {
    ingestManifestFragments: async (_, args) => {
      await ManifestFragmentDomain.ingestManifestFragments(args);
      return { success: true };
    },
  },
};

export default resolvers;
