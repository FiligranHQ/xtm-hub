import { beforeAll, describe, expect, it } from 'vitest';
import {
  PLATFORM_ORGANIZATION_UUID,
  SYSTEM_USER_CONTEXT,
  SYSTEM_USER_UUID,
} from '../../portal.const';
import { requestContext } from '../../requestContext';
import { minioInit } from '../../server/initialize';
import {
  getLabels,
  loadImagesByDocumentId,
} from '../services/document/document.domain';
import {
  Connector,
  INTEGRATION_FEEDS_SERVICE_INSTANCE_ID,
} from '../services/integration-feeds/integration-feeds.model';
import { upsertConnectors } from './ingest-manifest.domain';
import { ManifestInformation } from './ingest-manifest.model';
import sampleExtractedManifest from './test/sample-extracted-manifest.json';

describe('upsertConnectors', () => {
  beforeAll(async () => {
    await minioInit();
  });
  describe('when creating new connectors', () => {
    let result: Connector[];

    beforeAll(async () => {
      requestContext.set({
        user: SYSTEM_USER_CONTEXT.user,
        portalContext: SYSTEM_USER_CONTEXT,
      });
      result = await upsertConnectors(
        sampleExtractedManifest as ManifestInformation[]
      );
    });

    it('should return an array with correct length', () => {
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(sampleExtractedManifest.length);
    });

    describe('system fields', () => {
      it('should set correct uploader information', () => {
        result.forEach((doc) => {
          expect(doc.uploader_id).toBe(SYSTEM_USER_UUID);
          expect(doc.uploader_organization_id).toBe(PLATFORM_ORGANIZATION_UUID);
          expect(doc.service_instance_id).toBe(
            INTEGRATION_FEEDS_SERVICE_INSTANCE_ID
          );
        });
      });

      it('should set correct document type and status', () => {
        result.forEach((doc) => {
          expect(doc.type).toBe('opencti_integration_feed');
          expect(doc.source_type).toBe('external');
          expect(doc.active).toBe(true);
        });
      });

      it('should set creation timestamp and null update fields', () => {
        result.forEach((doc) => {
          expect(doc.created_at).toBeDefined();
          expect(new Date(doc.created_at)).toBeInstanceOf(Date);
          expect(doc.updated_at).toBeNull();
          expect(doc.updater_id).toBeNull();
          expect(doc.remover_id).toBeNull();
        });
      });

      it('should have null file-related fields', () => {
        result.forEach((doc) => {
          expect(doc.file_name).toBeNull();
          expect(doc.minio_name).toBeNull();
          expect(doc.mime_type).toBeNull();
        });
      });
    });

    describe('manifest content mapping', () => {
      it('should correctly map all manifest fields', () => {
        result.forEach((doc, index) => {
          const expectedManifest = sampleExtractedManifest[index];
          expect(expectedManifest).toBeTruthy();
          if (!expectedManifest) {
            return;
          }

          expect(doc.name).toBe(expectedManifest.name);
          expect(doc.description).toBe(expectedManifest.description);
          expect(doc.short_description).toBe(
            expectedManifest.short_description
          );
          expect(doc.slug).toBe(expectedManifest.slug);
          expect(doc.product_version).toBe(expectedManifest.product_version);
        });
      });
    });

    describe('Contract One connector', () => {
      let contractOne: Connector;

      beforeAll(() => {
        contractOne = result.find(
          (doc) => doc.slug === 'contract-one'
        ) as Connector;
      });

      it('should exist with correct content', () => {
        expect(contractOne.name).toBe('Contract One');
        expect(contractOne.description).toBe('This is the first contract');
        expect(contractOne.short_description).toBe('First contract');
      });

      it('should have automation and integration labels', async () => {
        const labels = await getLabels(SYSTEM_USER_CONTEXT, contractOne.id);
        const labelNames = labels.map((label) => label.name);

        expect(labelNames).toHaveLength(2);
        expect(labelNames).toContain('automation');
        expect(labelNames).toContain('integration');
      });
      it('should have related logo', async () => {
        const images = await loadImagesByDocumentId(contractOne.id);
        expect(images).toHaveLength(1);
        expect(images[0].file_name).toBe('contract-one-logo.png');
      });
    });

    describe('Contract Two connector', () => {
      let contractTwo: Connector;

      beforeAll(() => {
        contractTwo = result.find(
          (doc) => doc.slug === 'contract-two'
        ) as Connector;
      });

      it('should exist with correct content', () => {
        expect(contractTwo).toBeDefined();
        expect(contractTwo.name).toBe('Contract Two');
        expect(contractTwo.description).toBe('This is the second contract');
        expect(contractTwo.short_description).toBe('Second contract');
      });
      it('should have automation and integration labels', async () => {
        const labels = await getLabels(SYSTEM_USER_CONTEXT, contractTwo.id);
        const labelNames = labels.map((label) => label.name);

        expect(labelNames).toHaveLength(1);
        expect(labelNames).toContain('monitoring');
      });
    });
  });

  describe('when updating existing connectors', () => {
    let firstResult: Connector[];
    let secondResult: Connector[];
    let updatedManifest: ManifestInformation[];

    beforeAll(async () => {
      // First creation
      requestContext.set({
        user: SYSTEM_USER_CONTEXT.user,
        portalContext: SYSTEM_USER_CONTEXT,
      });
      firstResult = await upsertConnectors(
        sampleExtractedManifest as ManifestInformation[]
      );

      // Prepare updated manifest
      updatedManifest = sampleExtractedManifest.map((manifest) => ({
        ...manifest,
        description: `${manifest.description} - Updated`,
        short_description: `${manifest.short_description} - Updated`,
        product_version: '1.2.2-test',
        labels: ['updated label 1', 'updated label 2'],
      })) as ManifestInformation[];

      // Second call - update
      secondResult = await upsertConnectors(
        updatedManifest as ManifestInformation[]
      );
    });

    it('should return same number of documents', () => {
      expect(secondResult).toHaveLength(updatedManifest.length);
    });

    it('should preserve document IDs', () => {
      secondResult.forEach((doc, index) => {
        expect(doc.id).toBe((firstResult[index] as Connector).id);
      });
    });

    it('should update description fields', () => {
      secondResult.forEach((doc, index) => {
        const expectedManifest = updatedManifest[index];
        expect(expectedManifest).toBeDefined();
        if (!expectedManifest) {
          return;
        }
        expect(doc.description).toBe(expectedManifest.description);
        expect(doc.short_description).toBe(expectedManifest.short_description);
        expect(doc.description).toContain('- Updated');
        expect(doc.short_description).toContain('- Updated');
      });
    });

    it('should preserve slug', () => {
      secondResult.forEach((doc, index) => {
        expect(doc.slug).toBe((firstResult[index] as Connector).slug);
      });
    });

    it('should preserve version from first creation', () => {
      secondResult.forEach((doc, index) => {
        expect(doc.product_version).toBe(
          (firstResult[index] as Connector).product_version
        );
      });
    });

    it('should update timestamps and updater information', () => {
      secondResult.forEach((doc, index) => {
        expect(doc.created_at).toEqual(
          (firstResult[index] as Connector).created_at
        );
        expect(doc.updated_at).not.toBeNull();
        expect(doc.updater_id).toBe(SYSTEM_USER_UUID);
      });
    });
    it('should update labels to new values', async () => {
      // Test labels for each document
      for (const doc of secondResult) {
        const labels = await getLabels(SYSTEM_USER_CONTEXT, doc.id);
        const labelNames = labels.map((label) => label.name);

        expect(labelNames).toHaveLength(2);
        expect(labelNames).toContain('updated label 1');
        expect(labelNames).toContain('updated label 2');
      }
    });

    it('should have updated logo', async () => {
      secondResult.forEach(async (doc) => {
        const images = await loadImagesByDocumentId(doc.id);
        // Verify that we still have only one image after updating
        expect(images).toHaveLength(1);
        expect(images[0].file_name).toBe(`${doc.slug}-logo.png`);
      });
    });
  });

  describe('edge cases', () => {
    it('should handle empty manifest array', async () => {
      const result = await upsertConnectors([]);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(0);
    });
  });
});
