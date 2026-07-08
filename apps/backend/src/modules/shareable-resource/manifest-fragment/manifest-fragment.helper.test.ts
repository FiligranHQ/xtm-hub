import { describe, expect, it } from 'vitest';
import { BadRequestErrorCode } from '../../../utils/error/error.code';
import { ManifestFragmentHelper } from './manifest-fragment.helper';

describe('validateAndFormatManifestVersion', () => {
  it.each`
    input                 | expected
    ${'7.260309.0-lts.5'} | ${'007.260309.000.LTS.005'}
    ${'7.260309.0'}       | ${'007.260309.000'}
    ${'6.5.1'}            | ${'006.000005.001'}
    ${'6.5.1-lts.2'}      | ${'006.000005.001.LTS.002'}
  `('formats "$input" as "$expected"', ({ input, expected }) => {
    expect(ManifestFragmentHelper.validateAndFormatManifestVersion(input)).toBe(
      expected
    );
  });

  it.each`
    input
    ${'not-a-version'}
    ${'6.5'}
    ${'6'}
    ${'6.0.4.5'}
    ${'LTS.1.2.3'}
    ${'7.20260703.0'}
    ${'>= 7.260309.0'}
  `('throws when version format is invalid: "$input"', ({ input }) => {
    expect(() =>
      ManifestFragmentHelper.validateAndFormatManifestVersion(input)
    ).toThrow(BadRequestErrorCode.InvalidManifestVersionFormat);
  });
});

describe('validateShortDescriptionLength', () => {
  it.each`
    length | description
    ${0}   | ${'empty string'}
    ${1}   | ${'single character'}
    ${250} | ${'exactly the max length'}
  `(
    'accepts a short_description of length $length ($description)',
    ({ length }) => {
      expect(() =>
        ManifestFragmentHelper.validateShortDescriptionLength(
          'a'.repeat(length)
        )
      ).not.toThrow();
    }
  );

  it.each`
    length | description
    ${251} | ${'one character over the max length'}
    ${300} | ${'well over the max length'}
  `(
    'throws for a short_description of length $length ($description)',
    ({ length }) => {
      expect(() =>
        ManifestFragmentHelper.validateShortDescriptionLength(
          'a'.repeat(length)
        )
      ).toThrow(BadRequestErrorCode.ShortDescriptionTooLong);
    }
  );
});

describe('getLatestTagForConnectorVersion', () => {
  it.each`
    input                       | expected
    ${'007.260309.000'}         | ${'latest'}
    ${'007.260309.000.LTS.005'} | ${'latest-lts'}
  `('returns "$expected" for "$input"', ({ input, expected }) => {
    expect(ManifestFragmentHelper.getLatestTagForConnectorVersion(input)).toBe(
      expected
    );
  });
});

describe('isStrictlyGreaterConnectorVersion', () => {
  it.each`
    candidate                   | current                     | expected
    ${'007.260309.001'}         | ${'007.260309.000'}         | ${true}
    ${'007.260309.000'}         | ${'007.260309.000'}         | ${false}
    ${'007.260308.999'}         | ${'007.260309.000'}         | ${false}
    ${'007.260309.001.LTS.002'} | ${'007.260309.001.LTS.001'} | ${true}
    ${'007.260309.000'}         | ${''}                       | ${true}
  `(
    'compares padded candidate "$candidate" with current "$current"',
    ({ candidate, current, expected }) => {
      expect(
        ManifestFragmentHelper.isStrictlyGreaterConnectorVersion({
          candidate,
          current,
        })
      ).toBe(expected);
    }
  );
});

describe('getConnectorMetadataFromExisting', () => {
  it('returns undefined when no metadata is available', () => {
    expect(
      ManifestFragmentHelper.getConnectorMetadataFromExisting({
        currentLatestConnector: undefined,
        existingBatchConnectors: [],
      })
    ).toBeUndefined();
  });

  it('prefers current latest metadata and falls back to existing connectors', () => {
    expect(
      ManifestFragmentHelper.getConnectorMetadataFromExisting({
        currentLatestConnector: {
          datasheet_url: 'https://latest/datasheet',
        },
        existingBatchConnectors: [
          {
            datasheet_url: 'https://existing/datasheet',
            blogpost_url: 'https://existing/blogpost',
            demo_url: 'https://existing/demo',
          },
        ],
      })
    ).toEqual({
      datasheet_url: 'https://latest/datasheet',
      blogpost_url: 'https://existing/blogpost',
      demo_url: 'https://existing/demo',
    });
  });
});

describe('getConnectorDocumentTags', () => {
  it.each`
    shouldPromoteAsLatest | latestTag       | expected
    ${true}               | ${'latest'}     | ${['decoupling', 'latest']}
    ${true}               | ${'latest-lts'} | ${['decoupling', 'latest-lts']}
    ${false}              | ${'latest'}     | ${['decoupling']}
  `(
    'builds tags for shouldPromoteAsLatest=$shouldPromoteAsLatest',
    ({ shouldPromoteAsLatest, latestTag, expected }) => {
      expect(
        ManifestFragmentHelper.getConnectorDocumentTags(
          shouldPromoteAsLatest,
          latestTag
        )
      ).toEqual(expected);
    }
  );
});

describe('buildConnectorLogoFilename', () => {
  it('builds a unique filename based on connector title and version', () => {
    expect(
      ManifestFragmentHelper.buildConnectorLogoFilename({
        title: 'MISP',
        version: '7.260309.0-lts.5',
      })
    ).toBe('MISP-7.260309.0-lts.5-logo.png');
  });
});

describe('findMinConnectorVersion', () => {
  it.each([
    [[], undefined],
    [['6.5.1'], '6.5.1'],
    [['6.5.1', '7.0.0'], '6.5.1'],
    [['7.0.0', '6.5.1'], '6.5.1'],
    [['7.260309.0-lts.5', '6.5.1'], '6.5.1'],
    [['6.5.1-lts.2', '6.5.1-lts.1'], '6.5.1-lts.1'],
    [['6.5.1', '6.5.1'], '6.5.1'],
  ])('returns %s for %s', (versions, expected) => {
    expect(ManifestFragmentHelper.findMinConnectorVersion(versions)).toBe(
      expected
    );
  });
});

describe('assertHomogeneousLtsBatch', () => {
  it('returns false (non-LTS) for an empty batch', () => {
    expect(ManifestFragmentHelper.assertHomogeneousLtsBatch([])).toBe(false);
  });

  it('returns false for a non-LTS batch', () => {
    expect(
      ManifestFragmentHelper.assertHomogeneousLtsBatch([
        { version: '7.0.0' },
        { version: '7.1.0' },
      ])
    ).toBe(false);
  });

  it('returns true for an LTS batch', () => {
    expect(
      ManifestFragmentHelper.assertHomogeneousLtsBatch([
        { version: '7.260309.0-lts.5' },
        { version: '7.260309.0-lts.6' },
      ])
    ).toBe(true);
  });

  it('rejects a batch mixing LTS and non-LTS fragments', () => {
    expect(() =>
      ManifestFragmentHelper.assertHomogeneousLtsBatch([
        { version: '7.0.0' },
        { version: '7.260309.0-lts.5' },
      ])
    ).toThrow(BadRequestErrorCode.MixedLtsManifestFragments);
  });
});
