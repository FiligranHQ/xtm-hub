import { v4 as uuidv4 } from 'uuid';
import { describe, expect, it, vi } from 'vitest';
import {
  contextSimpleUserFiligran2,
  GRAPHQL_RESOLVE_INFO,
  TEST_ORGANIZATIONS,
} from '../../../../../tests/tests.const';
import Organization from '../../../../model/kanel/public/Organization';
import {
  ForbiddenErrorCode,
  NotFoundErrorCode,
  UnknownErrorCode,
} from '../../../../utils/error/error.code';
import { registrationApp } from '../../registration.app';
import registrationResolver from '../../registration.resolver';

describe('query.platformAssociatedOrganization', () => {
  it('should return the organization returned by the app on success', async () => {
    // Given
    const platformId = uuidv4();
    const organization = {
      id: TEST_ORGANIZATIONS.FILIGRAN.ID,
      name: TEST_ORGANIZATIONS.FILIGRAN.NAME,
    };
    vi.spyOn(
      registrationApp,
      'loadPlatformAssociatedOrganization'
    ).mockResolvedValue(organization as unknown as Organization);

    // When
    const result = await registrationResolver.Query!
      .platformAssociatedOrganization!(
      {},
      { platformId },
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    // Then
    expect(
      registrationApp.loadPlatformAssociatedOrganization
    ).toHaveBeenCalledWith(platformId, undefined);
    expect(result).toMatchObject({
      id: TEST_ORGANIZATIONS.FILIGRAN.ID,
      name: TEST_ORGANIZATIONS.FILIGRAN.NAME,
    });
  });

  it('should forward tenantId to the app when provided', async () => {
    // Given
    const platformId = uuidv4();
    const tenantId = uuidv4();
    const organization = {
      id: TEST_ORGANIZATIONS.FILIGRAN.ID,
      name: TEST_ORGANIZATIONS.FILIGRAN.NAME,
    };
    vi.spyOn(
      registrationApp,
      'loadPlatformAssociatedOrganization'
    ).mockResolvedValue(organization as unknown as Organization);

    // When
    await registrationResolver.Query!.platformAssociatedOrganization!(
      {},
      { platformId, tenantId },
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    // Then
    expect(
      registrationApp.loadPlatformAssociatedOrganization
    ).toHaveBeenCalledWith(platformId, tenantId);
  });

  it('should return null when the platform has no associated organization', async () => {
    // Given
    const platformId = uuidv4();
    vi.spyOn(
      registrationApp,
      'loadPlatformAssociatedOrganization'
    ).mockResolvedValue(null);

    // When
    const result = await registrationResolver.Query!
      .platformAssociatedOrganization!(
      {},
      { platformId },
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    // Then
    expect(result).toBeNull();
  });

  it.each`
    errorCode                                     | description
    ${NotFoundErrorCode.SubscriptionNotFound}     | ${'SubscriptionNotFound'}
    ${ForbiddenErrorCode.UserIsNotInOrganization} | ${'UserIsNotInOrganization'}
    ${UnknownErrorCode.UnknownError}              | ${'unknown error'}
  `(
    'should throw a mapped GraphQL error for $description',
    async ({ errorCode }: { errorCode: string }) => {
      // Given
      const platformId = uuidv4();
      vi.spyOn(
        registrationApp,
        'loadPlatformAssociatedOrganization'
      ).mockRejectedValue(new Error(errorCode));

      // When
      const call = registrationResolver.Query!.platformAssociatedOrganization!(
        {},
        { platformId },
        contextSimpleUserFiligran2,
        GRAPHQL_RESOLVE_INFO
      );

      // Then
      await expect(call).rejects.toThrow(errorCode);
    }
  );
});
