import { describe, expect, it } from 'vitest';
import { PlatformIdentifier } from '../../__generated__/resolvers-types';
import { RegistrationHelper } from './registration.helper';

describe('registration helper', () => {
  describe('isTenantIdRequired', () => {
    it.each`
      identifier                    | version      | expected | description
      ${PlatformIdentifier.Opencti} | ${'6.9.0'}   | ${false} | ${'identifier never requires tenant id'}
      ${PlatformIdentifier.Openaev} | ${undefined} | ${false} | ${'missing version is treated as legacy'}
      ${PlatformIdentifier.Openaev} | ${null}      | ${false} | ${'null version is treated as legacy'}
      ${PlatformIdentifier.Openaev} | ${'2.4'}     | ${false} | ${'invalid version format does not require tenant id'}
      ${PlatformIdentifier.Openaev} | ${'2.3.9'}   | ${false} | ${'version below threshold does not require tenant id'}
      ${PlatformIdentifier.Openaev} | ${'2.4.0'}   | ${true}  | ${'version at threshold requires tenant id'}
      ${PlatformIdentifier.Openaev} | ${'2.8.12'}  | ${true}  | ${'version above threshold requires tenant id'}
    `(
      'should return $expected for $identifier at version $version ($description)',
      ({ identifier, version, expected }) => {
        const result = RegistrationHelper.isTenantIdRequired(
          identifier,
          version
        );

        expect(result).toBe(expected);
      }
    );
  });
});
