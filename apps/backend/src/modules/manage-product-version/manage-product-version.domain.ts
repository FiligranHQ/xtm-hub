import { db } from '../../../knexfile';
import type { PlatformIdentifier } from '../../__generated__/resolvers-types';
import type ProductVersion from '../../model/kanel/public/ProductVersion';
import type { ProductVersionInitializer } from '../../model/kanel/public/ProductVersion';

export const ManageProductVersionDomain = {
  registerProductVersion: async (
    initializer: ProductVersionInitializer
  ): Promise<void> => {
    await db<ProductVersion>('ProductVersion')
      .insert(initializer)
      .onConflict(['product', 'version'])
      .ignore();
  },

  loadRegisteredProductVersions: async (
    product: PlatformIdentifier
  ): Promise<ProductVersion[]> => {
    return db<ProductVersion>('ProductVersion')
      .where({ product })
      .orderBy([
        { column: 'version_padded', order: 'desc' },
        { column: 'id', order: 'desc' },
      ]);
  },
};
