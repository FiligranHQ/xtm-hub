import { ManifestType, Resolvers } from '../../__generated__/resolvers-types';
import { ManifestFragmentHelper } from '../shareable-resource/manifest-fragment/manifest-fragment.helper';
import { ManifestApp } from '../shareable-resource/manifest/manifest.app';
import { ManageProductVersionDomain } from './manage-product-version.domain';

const resolvers: Resolvers = {
  Query: {
    registeredProductVersions: async (_, { product }) => {
      return ManageProductVersionDomain.loadRegisteredProductVersions(product);
    },
  },
  Mutation: {
    newProductVersion: async (_, { product, version }) => {
      await ManifestApp.requestManifestGeneration({
        product,
        version,
        type: ManifestType.Connector,
      });

      await ManageProductVersionDomain.registerProductVersion({
        product,
        version,
        version_padded:
          ManifestFragmentHelper.validateAndFormatManifestVersion(version),
      });

      return {
        success: true,
      };
    },
  },
};

export default resolvers;
