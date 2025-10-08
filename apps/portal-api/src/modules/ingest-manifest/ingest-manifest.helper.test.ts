import { describe, expect, it } from 'vitest';
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
          version: '1.0.0',
          name: 'Contract One',
          slug: 'contract-one',
          description: 'This is the first contract',
          shortDescription: 'First contract',
          logo: 'data:image/png;base64,abc123',
          useCases: ['automation', 'integration'],
          verified: true,
          containerImage: 'docker.io/example/image:latest',
          containerType: 'docker',
          sourceCode: 'https://github.com/example/repo',
          subscriptionLink: 'https://example.com/subscribe',
        });

        expect(result[1]).toEqual({
          version: '1.0.0',
          name: 'Contract Two',
          slug: 'contract-two',
          description: 'This is the second contract',
          shortDescription: 'Second contract',
          logo: 'https://example.com/logo.png',
          useCases: ['monitoring'],
          verified: false,
          containerImage: 'docker.io/example/image2:latest',
          containerType: 'kubernetes',
          sourceCode: 'https://github.com/example/repo2',
          subscriptionLink: 'https://example.com/subscribe2',
        });
      });

      it('should return correct ManifestInformation type with expected properties', () => {
        const manifestInfo: ManifestInformation[] =
          extractManifestInformation(sampleManifest);

        // Check that we have results
        expect(manifestInfo).toBeDefined();
        expect(manifestInfo.length).toBeGreaterThan(0);

        // Check the structure of the first item to ensure it matches ManifestInformation type
        const firstItem = manifestInfo[0];

        // Check required properties exist and are of correct type
        expect(firstItem).toHaveProperty('version');
        expect(typeof firstItem!.name).toBe('string');

        expect(firstItem).toHaveProperty('name');
        expect(typeof firstItem!.name).toBe('string');

        expect(firstItem).toHaveProperty('description');
        expect(typeof firstItem!.description).toBe('string');

        expect(firstItem).toHaveProperty('shortDescription');
        expect(typeof firstItem!.shortDescription).toBe('string');

        expect(firstItem).toHaveProperty('containerImage');
        expect(typeof firstItem!.containerImage).toBe('string');

        expect(firstItem).toHaveProperty('slug');
        expect(typeof firstItem!.slug).toBe('string');

        expect(firstItem).toHaveProperty('logo');
        expect(typeof firstItem!.logo).toBe('string');

        expect(firstItem).toHaveProperty('verified');
        expect(typeof firstItem!.verified).toBe('boolean');

        expect(firstItem).toHaveProperty('containerType');
        expect(typeof firstItem!.containerType).toBe('string');

        expect(firstItem).toHaveProperty('useCases');
        expect(Array.isArray(firstItem!.useCases)).toBe(true);

        // Check optional properties if they exist
        if (firstItem!.sourceCode !== undefined) {
          expect(typeof firstItem!.sourceCode).toBe('string');
        }

        if (firstItem!.subscriptionLink !== undefined) {
          expect(typeof firstItem!.subscriptionLink).toBe('string');
        }
      });
    });

    describe('with invalid manifest data', () => {
      it('should return empty array for invalid data structure', () => {
        const invalidData = {
          data: {
            // Missing contracts array
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
                // Missing required fields
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
