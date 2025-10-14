import { describe, expect, it } from 'vitest';
import {
  INTEGRATION_FEED_CONNECTORS_TYPE,
  OPENCTI_INTEGRATION_FEED_DOCUMENT_TYPE,
} from '../services/integration-feeds/integration-feeds.model';
import { extractManifestInformation } from './ingest-manifest.helper';
import { ManifestInformation } from './ingest-manifest.model';
import sampleManifest from './test/sample-manifest.json';

describe('Ingest manifest helper', () => {
  describe('extractManifestInfo', () => {
    describe('with valid manifest data', () => {
      it('should extract manifest information from valid JSON', () => {
        const result = extractManifestInformation(sampleManifest);
        expect(result).toHaveLength(2);
        expect(result[0]).toEqual({
          product_version: '1.0.0',
          name: 'Contract One',
          slug: 'contract-one',
          description: 'This is the first contract',
          short_description: 'First contract',
          logo: 'data:image/png;base64,abc123',
          labels: ['automation', 'integration'],
          verified: true,
          container_image: 'docker.io/example/image:latest',
          integration_subtype: 'docker',
          source_code: 'https://github.com/example/repo',
          subscription_link: 'https://example.com/subscribe',
          type: OPENCTI_INTEGRATION_FEED_DOCUMENT_TYPE,
          integration_type: INTEGRATION_FEED_CONNECTORS_TYPE,
          manager_supported: true,
          playbook_supported: false,
          source_type: 'external',
          service_instance_id: '0f4aad4b-bdd6-4084-8b1f-82c9c66578cc',
        });
        expect(result[1]).toEqual({
          product_version: '1.0.0',
          name: 'Contract Two',
          slug: 'contract-two',
          description: 'This is the second contract',
          short_description: 'Second contract',
          logo: 'https://example.com/logo.png',
          labels: ['monitoring'],
          verified: false,
          container_image: 'docker.io/example/image2:latest',
          integration_subtype: 'kubernetes',
          source_code: 'https://github.com/example/repo2',
          subscription_link: 'https://example.com/subscribe2',
          type: OPENCTI_INTEGRATION_FEED_DOCUMENT_TYPE,
          integration_type: INTEGRATION_FEED_CONNECTORS_TYPE,
          manager_supported: false,
          playbook_supported: true,
          source_type: 'external',
          service_instance_id: '0f4aad4b-bdd6-4084-8b1f-82c9c66578cc',
        });
      });

      it('should return correct ManifestInformation type with expected properties', () => {
        const manifestInfo: ManifestInformation[] =
          extractManifestInformation(sampleManifest);
        expect(manifestInfo).toBeDefined();
        expect(manifestInfo.length).toBeGreaterThan(0);
        const firstItem = manifestInfo[0];
        expect(firstItem).toBeTruthy();
        if (!firstItem) {
          return;
        }
        expect(firstItem).toHaveProperty('product_version');
        expect(typeof firstItem.product_version).toBe('string');
        expect(firstItem).toHaveProperty('name');
        expect(typeof firstItem.name).toBe('string');
        expect(firstItem).toHaveProperty('description');
        expect(typeof firstItem.description).toBe('string');
        expect(firstItem).toHaveProperty('short_description');
        expect(typeof firstItem.short_description).toBe('string');
        expect(firstItem).toHaveProperty('container_image');
        expect(typeof firstItem.container_image).toBe('string');
        expect(firstItem).toHaveProperty('slug');
        expect(typeof firstItem.slug).toBe('string');
        expect(firstItem).toHaveProperty('logo');
        expect(typeof firstItem.logo).toBe('string');
        expect(firstItem).toHaveProperty('verified');
        expect(typeof firstItem.verified).toBe('boolean');
        expect(firstItem).toHaveProperty('integration_subtype');
        expect(typeof firstItem.integration_subtype).toBe('string');
        expect(firstItem).toHaveProperty('integration_type');
        expect(typeof firstItem.integration_type).toBe('string');
        expect(firstItem).toHaveProperty('type');
        expect(typeof firstItem.type).toBe('string');
        expect(firstItem).toHaveProperty('labels');
        expect(Array.isArray(firstItem.labels)).toBe(true);
        expect(firstItem).toHaveProperty('manager_supported');
        expect(typeof firstItem.manager_supported).toBe('boolean');
        expect(firstItem).toHaveProperty('playbook_supported');
        expect(typeof firstItem.playbook_supported).toBe('boolean');
        expect(typeof firstItem.source_code).toBe('string');

        if (firstItem.subscription_link !== undefined) {
          expect(typeof firstItem.subscription_link).toBe('string');
        }
      });
    });

    describe('with invalid manifest data', () => {
      it('should return empty array for invalid data structure', () => {
        const invalidData = {
          data: {
            id: 'test',
          },
        };
        const result = extractManifestInformation(invalidData);
        expect(result).toEqual([]);
      });

      it('should return empty array for missing required fields', () => {
        const invalidManifest = {
          data: {
            contracts: [
              {
                title: 'Test Contract',
              },
            ],
          },
        };
        const result = extractManifestInformation(invalidManifest);
        expect(result).toEqual([]);
      });

      it('should return empty array for null input', () => {
        const result = extractManifestInformation(null);
        expect(result).toEqual([]);
      });

      it('should return empty array for undefined input', () => {
        const result = extractManifestInformation(undefined);
        expect(result).toEqual([]);
      });

      it('should return empty array for non-object input', () => {
        const result = extractManifestInformation('not an object');
        expect(result).toEqual([]);
      });
    });

    describe('with empty contracts array', () => {
      it('should return empty array when contracts is empty', () => {
        const emptyContractsManifest = {
          data: {
            contracts: [],
          },
        };
        const result = extractManifestInformation(emptyContractsManifest);
        expect(result).toEqual([]);
      });
    });
  });
});
