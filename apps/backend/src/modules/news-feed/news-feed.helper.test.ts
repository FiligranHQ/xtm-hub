import { describe, expect, it } from 'vitest';
import { PlatformIdentifier } from '../../__generated__/resolvers-types';
import { doesPlatformSupportNewsFeed } from './news-feed.helper';

describe('news-feed.helper', () => {
  describe('doesPlatformSupportNewsFeed', () => {
    it.each`
      version             | expected
      ${'7.260527.0'}     | ${true}
      ${'7.260529.0'}     | ${true}
      ${'8.0.0'}          | ${true}
      ${'7.260801.0-lts'} | ${true}
      ${'7.260526.0'}     | ${false}
      ${'7.260512.0'}     | ${false}
      ${'6.8.0'}          | ${false}
      ${'1.0.0'}          | ${false}
    `(
      'returns $expected for OpenCTI version $version',
      ({ version, expected }) => {
        expect(
          doesPlatformSupportNewsFeed(PlatformIdentifier.Opencti, version)
        ).toBe(expected);
      }
    );

    it('returns false for a missing version', () => {
      expect(
        doesPlatformSupportNewsFeed(PlatformIdentifier.Opencti, null)
      ).toBe(false);
    });

    it('returns false for an invalid version', () => {
      expect(
        doesPlatformSupportNewsFeed(PlatformIdentifier.Opencti, 'not-a-version')
      ).toBe(false);
    });

    it('returns true when no minimum is configured for the identifier', () => {
      expect(
        doesPlatformSupportNewsFeed(PlatformIdentifier.Openaev, '1.0.0')
      ).toBe(true);
    });
  });
});
