import type { PlatformIdentifier } from '../../__generated__/resolvers-types';
import type ProductVersion from '../../model/kanel/public/ProductVersion';
import { ManifestFragmentHelper } from '../shareable-resource/manifest-fragment/manifest-fragment.helper';
import { ManageProductVersionDomain } from './manage-product-version.domain';

export const ManageProductVersionApp = {
  registerProductVersion: async ({
    product,
    version,
  }: {
    product: PlatformIdentifier;
    version: string;
  }): Promise<void> => {
    await ManageProductVersionDomain.registerProductVersion({
      product,
      version,
      version_padded:
        ManifestFragmentHelper.validateAndFormatManifestVersion(version),
    });
  },

  loadRegisteredProductVersions: async (
    product: PlatformIdentifier
  ): Promise<ProductVersion[]> => {
    return ManageProductVersionDomain.loadRegisteredProductVersions(product);
  },
};
