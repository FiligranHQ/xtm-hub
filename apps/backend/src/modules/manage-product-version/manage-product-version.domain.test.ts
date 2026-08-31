import { afterEach, describe, expect, it } from 'vitest';
import { TestHelper } from '../../../tests/helper/test.helper';
import { PlatformIdentifier } from '../../__generated__/resolvers-types';
import { ManifestFragmentHelper } from '../shareable-resource/manifest-fragment/manifest-fragment.helper';
import { ManageProductVersionDomain } from './manage-product-version.domain';

describe('manageProductVersionDomain', () => {
  describe('registerProductVersion', () => {
    afterEach(async () => {
      await TestHelper.productVersion.delete({});
    });

    it('should insert a new registered product version when none exists yet', async () => {
      await ManageProductVersionDomain.registerProductVersion({
        product: PlatformIdentifier.Opencti,
        version: '6.4.0',
        version_padded:
          ManifestFragmentHelper.validateAndFormatManifestVersion('6.4.0'),
      });

      const rows = await TestHelper.productVersion.loadAll({
        product: PlatformIdentifier.Opencti,
      });
      expect(rows).toHaveLength(1);
      expect(rows[0]!.version).toBe('6.4.0');
    });

    it('should not create a duplicate row when the same product/version is registered twice', async () => {
      await ManageProductVersionDomain.registerProductVersion({
        product: PlatformIdentifier.Opencti,
        version: '6.4.0',
        version_padded:
          ManifestFragmentHelper.validateAndFormatManifestVersion('6.4.0'),
      });
      await ManageProductVersionDomain.registerProductVersion({
        product: PlatformIdentifier.Opencti,
        version: '6.4.0',
        version_padded:
          ManifestFragmentHelper.validateAndFormatManifestVersion('6.4.0'),
      });

      const rows = await TestHelper.productVersion.loadAll({
        product: PlatformIdentifier.Opencti,
        version: '6.4.0',
      });
      expect(rows).toHaveLength(1);
    });
  });

  describe('loadRegisteredProductVersions', () => {
    afterEach(async () => {
      await TestHelper.productVersion.delete({});
    });

    it('should return an empty array when the requested product has no registered versions', async () => {
      const result =
        await ManageProductVersionDomain.loadRegisteredProductVersions(
          PlatformIdentifier.Opencti
        );
      expect(result).toEqual([]);
    });

    it('should only return versions matching the requested product when a filter is provided', async () => {
      await TestHelper.productVersion.create({
        product: PlatformIdentifier.Opencti,
        version: '6.4.0',
        version_padded:
          ManifestFragmentHelper.validateAndFormatManifestVersion('6.4.0'),
      });
      await TestHelper.productVersion.create({
        product: PlatformIdentifier.Openaev,
        version: '1.0.0',
        version_padded:
          ManifestFragmentHelper.validateAndFormatManifestVersion('1.0.0'),
      });

      const result =
        await ManageProductVersionDomain.loadRegisteredProductVersions(
          PlatformIdentifier.Opencti
        );

      expect(result).toHaveLength(1);
      expect(result[0]!.product).toBe(PlatformIdentifier.Opencti);
    });

    it('should order results by version_padded descending, most recent first', async () => {
      await TestHelper.productVersion.create({
        product: PlatformIdentifier.Opencti,
        version: '6.4.0',
        version_padded:
          ManifestFragmentHelper.validateAndFormatManifestVersion('6.4.0'),
      });
      await TestHelper.productVersion.create({
        product: PlatformIdentifier.Opencti,
        version: '6.5.0',
        version_padded:
          ManifestFragmentHelper.validateAndFormatManifestVersion('6.5.0'),
      });

      const result =
        await ManageProductVersionDomain.loadRegisteredProductVersions(
          PlatformIdentifier.Opencti
        );

      expect(result.map((row) => row.version)).toEqual(['6.5.0', '6.4.0']);
    });
  });
});
