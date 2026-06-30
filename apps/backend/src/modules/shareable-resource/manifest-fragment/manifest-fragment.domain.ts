import { type MutationIngestManifestFragmentsArgs } from '../../../__generated__/resolvers-types';

export const ManifestFragmentDomain = {
  ingestManifestFragments: async (
    _: MutationIngestManifestFragmentsArgs
  ): Promise<{ success: boolean }> => {
    return { success: true };
  },
};
