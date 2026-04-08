import { generateRegistrationContext } from '@/components/registration/context';
import { OrganizationCapabilityEnum } from '@generated/models/OrganizationCapability.enum';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import { describe, expect, it } from 'vitest';

describe('generateRegistrationContext', () => {
  it('returns only an empty displayedIdentifier when no identifier is provided', () => {
    const result = generateRegistrationContext(undefined);
    expect(result).toEqual({ displayedIdentifier: '' });
  });

  it.each`
    identifier                        | expectedName | description
    ${PlatformIdentifierEnum.OPENCTI} | ${'OpenCTI'} | ${'OPENCTI maps to OpenCTI'}
    ${PlatformIdentifierEnum.OPENAEV} | ${'OpenAEV'} | ${'OPENAEV maps to OpenAEV'}
  `(
    'returns the correct displayedIdentifier for $description',
    ({
      identifier,
      expectedName,
    }: {
      identifier: PlatformIdentifierEnum;
      expectedName: string;
    }) => {
      const result = generateRegistrationContext(identifier);
      expect(result.displayedIdentifier).toBe(expectedName);
    }
  );

  it.each`
    identifier                        | description
    ${PlatformIdentifierEnum.OPENCTI} | ${'OPENCTI'}
    ${PlatformIdentifierEnum.OPENAEV} | ${'OPENAEV'}
  `(
    'sets identifier and MANAGE_PLATFORM_REGISTRATION capability for $description',
    ({ identifier }: { identifier: PlatformIdentifierEnum }) => {
      const result = generateRegistrationContext(identifier);
      expect(result.identifier).toBe(identifier);
      expect(result.capability).toBe(
        OrganizationCapabilityEnum.MANAGE_PLATFORM_REGISTRATION
      );
    }
  );
});
