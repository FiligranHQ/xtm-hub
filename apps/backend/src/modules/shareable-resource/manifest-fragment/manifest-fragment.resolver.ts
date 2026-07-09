import { Resolvers } from '../../../__generated__/resolvers-types';
import { ManifestFragmentApp } from './manifest-fragment.app';

const resolvers: Resolvers = {
  Mutation: {
    ingestManifestFragments: async (_, args) => {
      await ManifestFragmentApp.ingestManifestFragments(args);
      return { success: true };
    },
  },
};

export default resolvers;
