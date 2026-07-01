import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TestHelper } from '../../../../tests/helper/test.helper';
import {
  DocumentMetadataKeyCode,
  IntegrationType,
  ManifestType,
  PlatformIdentifier,
} from '../../../__generated__/resolvers-types';
import type Document from '../../../model/kanel/public/Document';
import type { DocumentMetadataKey } from '../../../model/kanel/public/DocumentMetadata';
import {
  TAG_DECOUPLING,
  TAG_LATEST,
  TAG_LATEST_LTS,
} from '../manifest-fragment/manifest-fragment.utils';
import { ManifestApp } from './manifest.app';
import type { ManifestKey } from './manifest.consts';
import { ManifestRebuildQueueStatus } from './manifest.consts';
import { ManifestDomain } from './manifest.domain';
import { ManifestHelper } from './manifest.helper';

const MANIFEST_KEY: ManifestKey = {
  platformIdentifier: PlatformIdentifier.Opencti,
  version: '7.260309.0',
  type: ManifestType.Connector,
};

const LTS_KEY: ManifestKey = {
  platformIdentifier: PlatformIdentifier.Opencti,
  version: '7.260309.0-lts.5',
  type: ManifestType.Connector,
};

const createConnectorDocument = async (tags: string[]): Promise<Document> => {
  const doc = await TestHelper.document.create({
    active: true,
    is_decommissioned: false,
    tags: [...tags, TAG_DECOUPLING],
  });
  await TestHelper.documentMetadata.create({
    document_id: doc.id,
    key: DocumentMetadataKeyCode.IntegrationType as unknown as DocumentMetadataKey,
    value: IntegrationType.Connector,
  });
  return doc;
};

describe('manifestApp', () => {
  beforeEach(() => {
    vi.spyOn(ManifestHelper, 'uploadManifest').mockResolvedValue(undefined);
  });

  afterEach(async () => {
    await TestHelper.objectUseCase.delete({});
    await TestHelper.useCase.delete({});
    await TestHelper.manifest.delete({});
    await TestHelper.manifestRebuildQueue.delete({});
    await TestHelper.documentMetadata.delete({});
    await TestHelper.document.delete({});
  });

  describe('generateManifest', () => {
    beforeEach(async () => {
      // Create a Processing queue entry so deleteFromRebuildQueue succeeds
      await TestHelper.manifestRebuildQueue.create({
        product: MANIFEST_KEY.platformIdentifier,
        version: MANIFEST_KEY.version,
        type: MANIFEST_KEY.type,
        status: ManifestRebuildQueueStatus.Processing,
      });
    });

    describe('connector fetching and tag selection', () => {
      it('fetches only latest-tagged connectors for a standard version', async () => {
        const expected = await createConnectorDocument([TAG_LATEST]);
        await createConnectorDocument([TAG_LATEST_LTS]);

        await ManifestApp.generateManifest(MANIFEST_KEY);

        const [manifest] = await TestHelper.manifest.loadAll({});
        const links = await TestHelper.manifestDocument.loadAll({
          manifest_id: manifest!.id,
        });
        expect(links).toHaveLength(1);
        expect(links[0]!.document_id).toBe(expected.id);
      });

      it('fetches only latest-lts-tagged connectors for an LTS version', async () => {
        await TestHelper.manifestRebuildQueue.create({
          product: LTS_KEY.platformIdentifier,
          version: LTS_KEY.version,
          type: LTS_KEY.type,
          status: ManifestRebuildQueueStatus.Processing,
        });
        const expected = await createConnectorDocument([TAG_LATEST_LTS]);
        await createConnectorDocument([TAG_LATEST]);

        await ManifestApp.generateManifest(LTS_KEY);

        const [manifest] = await TestHelper.manifest.loadAll({});
        const links = await TestHelper.manifestDocument.loadAll({
          manifest_id: manifest!.id,
        });
        expect(links).toHaveLength(1);
        expect(links[0]!.document_id).toBe(expected.id);
      });

      it('excludes inactive connectors', async () => {
        const doc = await TestHelper.document.create({
          active: false,
          is_decommissioned: false,
          tags: [TAG_LATEST, TAG_DECOUPLING],
        });
        await TestHelper.documentMetadata.create({
          document_id: doc.id,
          key: DocumentMetadataKeyCode.IntegrationType as unknown as DocumentMetadataKey,
          value: IntegrationType.Connector,
        });

        await ManifestApp.generateManifest(MANIFEST_KEY);

        const links = await TestHelper.manifestDocument.loadAll({});
        expect(links).toHaveLength(0);
      });

      it('excludes decommissioned connectors', async () => {
        const doc = await TestHelper.document.create({
          active: true,
          is_decommissioned: true,
          tags: [TAG_LATEST, TAG_DECOUPLING],
        });
        await TestHelper.documentMetadata.create({
          document_id: doc.id,
          key: DocumentMetadataKeyCode.IntegrationType as unknown as DocumentMetadataKey,
          value: IntegrationType.Connector,
        });

        await ManifestApp.generateManifest(MANIFEST_KEY);

        const links = await TestHelper.manifestDocument.loadAll({});
        expect(links).toHaveLength(0);
      });
    });

    describe('db persistence', () => {
      it('inserts a Manifest row with the correct product, version and type', async () => {
        await createConnectorDocument([TAG_LATEST]);

        await ManifestApp.generateManifest(MANIFEST_KEY);

        const manifests = await TestHelper.manifest.loadAll({});
        expect(manifests).toHaveLength(1);
        expect(manifests[0]).toMatchObject({
          product: PlatformIdentifier.Opencti,
          version: '7.260309.0',
          type: ManifestType.Connector,
        });
      });

      it('sets the manifest name to the full manifest_version string', async () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-07-01T12:00:00Z'));
        await createConnectorDocument([TAG_LATEST]);

        await ManifestApp.generateManifest(MANIFEST_KEY);

        vi.useRealTimers();

        const [manifest] = await TestHelper.manifest.loadAll({});
        expect(manifest!.name).toBe(
          'connector-manifest-7.260309.0-260701120000'
        );
      });

      it('inserts a Manifest_Document link for each matching connector', async () => {
        const doc1 = await createConnectorDocument([TAG_LATEST]);
        const doc2 = await createConnectorDocument([TAG_LATEST]);

        await ManifestApp.generateManifest(MANIFEST_KEY);

        const [manifest] = await TestHelper.manifest.loadAll({});
        const links = await TestHelper.manifestDocument.loadAll({
          manifest_id: manifest!.id,
        });
        expect(links).toHaveLength(2);
        const linkedIds = links.map((l) => l.document_id);
        expect(linkedIds).toContain(doc1.id);
        expect(linkedIds).toContain(doc2.id);
      });

      it('inserts no Manifest_Document links when no connectors match', async () => {
        await ManifestApp.generateManifest(MANIFEST_KEY);

        const links = await TestHelper.manifestDocument.loadAll({});
        expect(links).toHaveLength(0);
      });

      it('deletes the matching queue entry but leaves others untouched', async () => {
        await TestHelper.manifestRebuildQueue.create({
          product: PlatformIdentifier.Openaev,
          version: '7.260309.0',
          type: ManifestType.Connector,
          status: ManifestRebuildQueueStatus.Processing,
        });
        await createConnectorDocument([TAG_LATEST]);

        await ManifestApp.generateManifest(MANIFEST_KEY);

        const remaining = await TestHelper.manifestRebuildQueue.loadAll({});
        expect(remaining).toHaveLength(1);
        expect(remaining[0]!.product).toBe(PlatformIdentifier.Openaev);
      });

      it('throws when no processing queue entry exists for the key', async () => {
        vi.spyOn(
          ManifestDomain,
          'deleteFromRebuildQueue'
        ).mockRejectedValueOnce(
          new Error('MANIFEST_REBUILD_QUEUE_ENTRY_NOT_FOUND')
        );
        await createConnectorDocument([TAG_LATEST]);

        await expect(
          ManifestApp.generateManifest(MANIFEST_KEY)
        ).rejects.toThrow('MANIFEST_REBUILD_QUEUE_ENTRY_NOT_FOUND');
      });
    });

    describe('minio upload ordering', () => {
      it('calls uploadManifest exactly once', async () => {
        await createConnectorDocument([TAG_LATEST]);
        await ManifestApp.generateManifest(MANIFEST_KEY);
        expect(ManifestHelper.uploadManifest).toHaveBeenCalledOnce();
      });

      it('writes nothing to the DB when uploadManifest throws', async () => {
        vi.mocked(ManifestHelper.uploadManifest).mockRejectedValueOnce(
          new Error('MinIO unavailable')
        );
        await createConnectorDocument([TAG_LATEST]);

        await expect(
          ManifestApp.generateManifest(MANIFEST_KEY)
        ).rejects.toThrow('MinIO unavailable');

        const manifests = await TestHelper.manifest.loadAll({});
        expect(manifests).toHaveLength(0);
      });
    });

    describe('return value', () => {
      it('returns a ManifestOutput with the correct product_version and contracts', async () => {
        await createConnectorDocument([TAG_LATEST]);

        const result = await ManifestApp.generateManifest(MANIFEST_KEY);

        expect(result).not.toBeNull();
        expect(result!.product_version).toBe('7.260309.0');
        expect(result!.contracts).toHaveLength(1);
      });
    });
  });

  describe('processManifestQueue', () => {
    beforeEach(() => {
      vi.spyOn(ManifestApp, 'generateManifest').mockResolvedValue({
        id: 'catalog-id',
        name: 'OpenCTI Connectors contracts',
        description: '',
        manifest_schema_version: '1',
        manifest_version: 'connector-manifest-6.4.0-test',
        product_version: '6.4.0',
        contracts: [],
      });
    });

    it('does not call generateManifest when the queue is empty', async () => {
      await ManifestApp.processManifestQueue();
      expect(ManifestApp.generateManifest).not.toHaveBeenCalled();
    });

    it('calls generateManifest for each pending row with the correct key', async () => {
      await TestHelper.manifestRebuildQueue.create({
        product: PlatformIdentifier.Opencti,
        version: '6.4.0',
        type: ManifestType.Connector,
        status: ManifestRebuildQueueStatus.Pending,
      });
      await TestHelper.manifestRebuildQueue.create({
        product: PlatformIdentifier.Openaev,
        version: '1.0.0',
        type: ManifestType.Connector,
        status: ManifestRebuildQueueStatus.Pending,
      });

      await ManifestApp.processManifestQueue();

      expect(ManifestApp.generateManifest).toHaveBeenCalledTimes(2);
      expect(ManifestApp.generateManifest).toHaveBeenCalledWith({
        platformIdentifier: PlatformIdentifier.Opencti,
        version: '6.4.0',
        type: ManifestType.Connector,
      });
      expect(ManifestApp.generateManifest).toHaveBeenCalledWith({
        platformIdentifier: PlatformIdentifier.Openaev,
        version: '1.0.0',
        type: ManifestType.Connector,
      });
    });

    it('only processes the matching row when a filter key is passed', async () => {
      await TestHelper.manifestRebuildQueue.create({
        product: PlatformIdentifier.Opencti,
        version: MANIFEST_KEY.version,
        type: ManifestType.Connector,
        status: ManifestRebuildQueueStatus.Pending,
      });
      await TestHelper.manifestRebuildQueue.create({
        product: PlatformIdentifier.Openaev,
        version: MANIFEST_KEY.version,
        type: ManifestType.Connector,
        status: ManifestRebuildQueueStatus.Pending,
      });

      await ManifestApp.processManifestQueue(MANIFEST_KEY);

      expect(ManifestApp.generateManifest).toHaveBeenCalledOnce();
      expect(ManifestApp.generateManifest).toHaveBeenCalledWith(MANIFEST_KEY);
    });

    it("ignores rows with status 'processing'", async () => {
      await TestHelper.manifestRebuildQueue.create({
        product: PlatformIdentifier.Opencti,
        version: '6.4.0',
        type: ManifestType.Connector,
        status: ManifestRebuildQueueStatus.Processing,
      });

      await ManifestApp.processManifestQueue();

      expect(ManifestApp.generateManifest).not.toHaveBeenCalled();
    });
  });
});
