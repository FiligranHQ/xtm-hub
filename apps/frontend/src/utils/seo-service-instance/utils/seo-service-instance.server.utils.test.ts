import { serverFetchGraphQL } from '@/relay/server-portal-api-fetch';
import { describe, expect, it, vi } from 'vitest';
import { isPublicServiceSlug } from './seo-service-instance.server.utils';

vi.mock('@/relay/server-portal-api-fetch', () => ({
  serverFetchGraphQL: vi.fn(),
}));

const KNOWN_SERVICE_SLUG = 'opencti-integrations';

describe('isPublicServiceSlug', () => {
  it.each([
    { slug: KNOWN_SERVICE_SLUG, expected: true },
    { slug: 'guessed-service', expected: false },
  ])(
    'should return $expected for the service slug "$slug"',
    async ({ slug, expected }) => {
      // Given the backend lists a single public service, plus one without slug
      vi.mocked(serverFetchGraphQL).mockResolvedValue({
        data: {
          seoServiceInstances: [{ slug: KNOWN_SERVICE_SLUG }, { slug: null }],
        },
      });

      // When checking the service slug
      const result = await isPublicServiceSlug(slug);

      // Then only the listed slug is considered public
      expect(result).toBe(expected);
    }
  );
});
