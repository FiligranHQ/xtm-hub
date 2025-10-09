import { PLATFORM_ORGANIZATION_UUID } from '@xtm-hub/test_e2e/tests/db-utils/const';
import { describe, expect, it } from 'vitest';
import { SYSTEM_USER_CONTEXT, SYSTEM_USER_UUID } from '../../portal.const';
import { INTEGRATION_FEEDS_SERVICE_INSTANCE_ID } from '../services/integration-feeds/integration-feeds.model';
import { upsertConnectors } from './ingest-manifest.domain';
import { ManifestInformation } from './ingest-manifest.model';
import sampleExtractedManifest from './test/sample-extracted-manifest.json';

describe('upsertConnectors', () => {
  describe('with valid manifest data', () => {
    it('should call upsertConnectors with extracted manifest', async () => {
      const result = await upsertConnectors(
        SYSTEM_USER_CONTEXT,
        sampleExtractedManifest as ManifestInformation[]
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(sampleExtractedManifest.length);

      result.forEach((doc, index) => {
        const expectedManifest = sampleExtractedManifest[index];

        // Check uploader fields
        expect(doc.uploader_id).toBe(SYSTEM_USER_UUID);
        expect(doc.uploader_organization_id).toBe(PLATFORM_ORGANIZATION_UUID);
        expect(doc.service_instance_id).toBe(
          INTEGRATION_FEEDS_SERVICE_INSTANCE_ID
        );

        expect(expectedManifest).toBeTruthy();
        if (!expectedManifest) {
          return;
        }
        // Check document content fields
        expect(doc.name).toBe(expectedManifest.name);
        expect(doc.description).toBe(expectedManifest.description);
        expect(doc.short_description).toBe(expectedManifest.short_description);
        expect(doc.slug).toBe(expectedManifest.slug);
        expect(doc.version).toBe(expectedManifest.version);
        expect(doc.type).toBe('opencti_integration_feed');
        expect(doc.source_type).toBe('external');

        expect(doc.active).toBe(true);
        expect(doc.download_number).toBe(0);
        expect(doc.share_number).toBe(0);
        expect(doc.created_at).toBeDefined();
        expect(new Date(doc.created_at)).toBeInstanceOf(Date);

        expect(doc.updated_at).toBeNull();
        expect(doc.updater_id).toBeNull();
        expect(doc.remover_id).toBeNull();
        expect(doc.file_name).toBeNull();
        expect(doc.minio_name).toBeNull();
        expect(doc.mime_type).toBeNull();
      });

      // Verify specific documents
      const contractOne = result.find((doc) => doc.slug === 'contract-one');
      expect(contractOne).toBeDefined();
      expect(contractOne?.name).toBe('Contract One');
      expect(contractOne?.description).toBe('This is the first contract');
      expect(contractOne?.short_description).toBe('First contract');

      const contractTwo = result.find((doc) => doc.slug === 'contract-two');
      expect(contractTwo).toBeDefined();
      expect(contractTwo?.name).toBe('Contract Two');
      expect(contractTwo?.description).toBe('This is the second contract');
      expect(contractTwo?.short_description).toBe('Second contract');
    });

    // Additional test for update scenario
    it('should update existing connectors on second call', async () => {
      const firstResult = await upsertConnectors(
        SYSTEM_USER_CONTEXT,
        sampleExtractedManifest as ManifestInformation[]
      );

      // Modify the manifest data
      const updatedManifest = sampleExtractedManifest.map((manifest) => ({
        ...manifest,
        description: `${manifest.description} - Updated`,
        short_description: `${manifest.short_description} - Updated`,
        version: '1.2.2-test',
      }));

      // Second call - update
      const secondResult = await upsertConnectors(
        SYSTEM_USER_CONTEXT,
        updatedManifest as ManifestInformation[]
      );

      expect(secondResult).toHaveLength(updatedManifest.length);

      // Verify updates
      secondResult.forEach((doc, index) => {
        const expectedManifest = updatedManifest[index];
        const originalDoc = firstResult[index];

        expect(expectedManifest).toBeTruthy();
        if (!expectedManifest) {
          return;
        }
        expect(doc.id).toBe(originalDoc.id);

        expect(doc.description).toBe(expectedManifest.description);
        expect(doc.short_description).toBe(expectedManifest.short_description);
        expect(doc.description).toContain('- Updated');
        expect(doc.short_description).toContain('- Updated');

        // Name and slug should remain the same
        expect(doc.name).toBe(originalDoc.name);
        expect(doc.slug).toBe(originalDoc.slug);
        expect(doc.version).toBe(originalDoc.version);

        // Timestamps should reflect update
        expect(doc.created_at).toEqual(originalDoc.created_at);
        expect(doc.updated_at).not.toBeNull();
        expect(doc.updater_id).not.toBeNull();
        expect(doc.updater_id).toEqual(SYSTEM_USER_UUID);
      });
    });
    it('should handle empty manifest array', async () => {
      const result = await upsertConnectors(SYSTEM_USER_CONTEXT, []);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(0);
    });
  });
});
