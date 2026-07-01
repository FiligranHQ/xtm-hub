import { Resolvers } from '../../../__generated__/resolvers-types';
import { ManifestFragmentDomain } from './manifest-fragment.domain';

const resolvers: Resolvers = {
  Mutation: {
    ingestManifestFragments: (_, args) =>
      ManifestFragmentDomain.ingestManifestFragments(args),
  },
};

export default resolvers;
