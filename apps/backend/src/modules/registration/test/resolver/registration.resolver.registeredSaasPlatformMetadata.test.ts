import { v4 as uuidv4 } from 'uuid';
import { describe, expect, it, vi } from 'vitest';
import {
  contextSimpleUserFiligran2,
  GRAPHQL_RESOLVE_INFO,
} from '../../../../../tests/tests.const';
import { SaasPlatformMetadata } from '../../../../__generated__/resolvers-types';
import { RegistrationApp } from '../../registration.app';
import registrationResolver from '../../registration.resolver';

describe('query.registeredSaasPlatformMetadata', () => {
  it('should pass the platformId to registrationApp and return its metadata', async () => {
    // Given
    const platformId = uuidv4();
    const expectedMetadata: SaasPlatformMetadata = {
      hostname: 'my-platform.example.com',
      plan: 'Enterprise',
      start_date: new Date('2026-01-01T00:00:00.000Z'),
      end_date: new Date('2027-01-01T00:00:00.000Z'),
      region: 'eu-west',
    };
    vi.spyOn(
      RegistrationApp,
      'loadRegisteredSaasPlatformMetadata'
    ).mockResolvedValue(expectedMetadata);

    // When
    const result = await registrationResolver.Query!
      .registeredSaasPlatformMetadata!(
      {},
      { platformId },
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    // Then
    expect(
      RegistrationApp.loadRegisteredSaasPlatformMetadata
    ).toHaveBeenCalledWith(platformId);
    expect(result).toMatchObject(expectedMetadata);
  });

  it('should return null when registrationApp cannot load the metadata', async () => {
    // Given
    vi.spyOn(
      RegistrationApp,
      'loadRegisteredSaasPlatformMetadata'
    ).mockResolvedValue(null);

    // When
    const result = await registrationResolver.Query!
      .registeredSaasPlatformMetadata!(
      {},
      { platformId: uuidv4() },
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    // Then
    expect(result).toBeNull();
  });
});
