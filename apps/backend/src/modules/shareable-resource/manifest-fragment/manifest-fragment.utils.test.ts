import { describe, expect, it } from 'vitest';
import { BadRequestErrorCode } from '../../../utils/error/error.code';
import { formatConnectorVersion } from './manifest-fragment.utils';

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
  });
});
