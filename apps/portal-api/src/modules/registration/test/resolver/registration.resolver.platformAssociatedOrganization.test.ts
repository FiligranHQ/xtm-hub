import { v4 as uuidv4 } from 'uuid';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  contextSimple2,
  INFO,
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

describe('Query.platformAssociatedOrganization', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

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
      contextSimple2,
      INFO
    );

    // Then
    expect(
      registrationApp.loadPlatformAssociatedOrganization
    ).toHaveBeenCalledWith(platformId);
    expect(result).toMatchObject({
      id: TEST_ORGANIZATIONS.FILIGRAN.ID,
      name: TEST_ORGANIZATIONS.FILIGRAN.NAME,
    });
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
      contextSimple2,
      INFO
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
        contextSimple2,
        INFO
      );

      // Then
      await expect(call).rejects.toThrow(errorCode);
    }
  );
});
