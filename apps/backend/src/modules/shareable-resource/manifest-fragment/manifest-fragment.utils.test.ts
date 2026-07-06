import { describe, expect, it } from 'vitest';
import { BadRequestErrorCode } from '../../../utils/error/error.code';
import {
  buildConnectorLogoFilename,
  formatConnectorVersion,
  getConnectorDocumentTags,
  getConnectorMetadataFromExisting,
  getLatestTagForConnectorVersion,
  isStrictlyGreaterConnectorVersion,
  validateConnectorMinimumVersion,
  validateShortDescriptionLength,
} from './manifest-fragment.utils';

describe('formatConnectorVersion', () => {
  it.each`
    input                 | expected
    ${'7.260309.0-lts.5'} | ${'007.260309.000.LTS.005'}
    ${'7.260309.0'}       | ${'007.260309.000'}
    ${'6.5.1'}            | ${'006.000005.001'}
    ${'6.5.1-lts.2'}      | ${'006.000005.001.LTS.002'}
  `('formats "$input" as "$expected"', ({ input, expected }) => {
    expect(formatConnectorVersion(input)).toBe(expected);
  });

  it('throws when version format is invalid', () => {
    expect(() => formatConnectorVersion('not-a-version')).toThrow(
      BadRequestErrorCode.InvalidConnectorVersionFormat
    );
    expect(() => formatConnectorVersion('6.5')).toThrow(
      BadRequestErrorCode.InvalidConnectorVersionFormat
    );
    expect(() => formatConnectorVersion('6')).toThrow(
      BadRequestErrorCode.InvalidConnectorVersionFormat
    );
    expect(() => formatConnectorVersion('6.0.4.5')).toThrow(
      BadRequestErrorCode.InvalidConnectorVersionFormat
    );
    expect(() => formatConnectorVersion('LTS.1.2.3')).toThrow(
      BadRequestErrorCode.InvalidConnectorVersionFormat
    );
    expect(() => formatConnectorVersion('7.20260703.0')).toThrow(
      BadRequestErrorCode.InvalidConnectorVersionFormat
    );
  });
});

describe('validateConnectorMinimumVersion', () => {
  it.each`
    input
    ${'7.260309.0'}
    ${'7.260309.0-lts.5'}
  `('accepts "$input"', ({ input }) => {
    expect(() => validateConnectorMinimumVersion(input)).not.toThrow();
  });

  it.each`
    input
    ${'>= 7.260309.0'}
    ${'not-a-version'}
    ${'7.20260703.0'}
  `('throws for invalid value "$input"', ({ input }) => {
    expect(() => validateConnectorMinimumVersion(input)).toThrow(
      BadRequestErrorCode.InvalidConnectorVersionFormat
    );
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
        validateShortDescriptionLength('a'.repeat(length))
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
      expect(() => validateShortDescriptionLength('a'.repeat(length))).toThrow(
        BadRequestErrorCode.ShortDescriptionTooLong
      );
    }
  );
});

describe('getLatestTagForConnectorVersion', () => {
  it.each`
    input                       | expected
    ${'007.260309.000'}         | ${'latest'}
    ${'007.260309.000.LTS.005'} | ${'latest-lts'}
  `('returns "$expected" for "$input"', ({ input, expected }) => {
    expect(getLatestTagForConnectorVersion(input)).toBe(expected);
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
        isStrictlyGreaterConnectorVersion({
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
      getConnectorMetadataFromExisting({
        currentLatestConnector: undefined,
        existingBatchConnectors: [],
      })
    ).toBeUndefined();
  });

  it('prefers current latest metadata and falls back to existing connectors', () => {
    expect(
      getConnectorMetadataFromExisting({
        currentLatestConnector: {
          datasheet_url: 'https://latest/datasheet',
        },
        existingBatchConnectors: [
          {
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
        getConnectorDocumentTags(shouldPromoteAsLatest, latestTag)
      ).toEqual(expected);
    }
  );
});

describe('buildConnectorLogoFilename', () => {
  it('builds a unique filename based on connector title and version', () => {
    expect(
      buildConnectorLogoFilename({
        title: 'MISP',
        version: '7.260309.0-lts.5',
      })
    ).toBe('MISP-7.260309.0-lts.5-logo.png');
  });
});
