import { generateRegistrationContext } from '@/components/registration/Context';
import { OrganizationCapability, PlatformIdentifier } from '@graphql/generated';
import { describe, expect, it } from 'vitest';

describe('generateRegistrationContext', () => {
  it('returns only an empty displayedIdentifier when no identifier is provided', () => {
    const result = generateRegistrationContext(undefined);
    expect(result).toEqual({ displayedIdentifier: '' });
  });

  it.each`
    identifier                    | expectedName | description
    ${PlatformIdentifier.Opencti} | ${'OpenCTI'} | ${'OPENCTI maps to OpenCTI'}
    ${PlatformIdentifier.Openaev} | ${'OpenAEV'} | ${'OPENAEV maps to OpenAEV'}
  `(
    'returns the correct displayedIdentifier for $description',
    ({
      identifier,
      expectedName,
    }: {
      identifier: PlatformIdentifier;
      expectedName: string;
    }) => {
      const result = generateRegistrationContext(identifier);
      expect(result.displayedIdentifier).toBe(expectedName);
    }
  );

  it.each`
    identifier                    | description
    ${PlatformIdentifier.Opencti} | ${'OPENCTI'}
    ${PlatformIdentifier.Openaev} | ${'OPENAEV'}
  `(
    'sets identifier and MANAGE_PLATFORM_REGISTRATION capability for $description',
    ({ identifier }: { identifier: PlatformIdentifier }) => {
      const result = generateRegistrationContext(identifier);
      expect(result.identifier).toBe(identifier);
      expect(result.capability).toBe(
        OrganizationCapability.ManagePlatformRegistration
      );
    }
  );
});
