import { v4 as uuidv4 } from 'uuid';
import { describe, expect, it, vi } from 'vitest';
import {
  contextSimpleUserFiligran2,
  GRAPHQL_RESOLVE_INFO,
  TEST_ORGANIZATIONS,
} from '../../../../../tests/tests.const';
import { CanUnregisterPlatformInput } from '../../../../__generated__/resolvers-types';
import { OrganizationId } from '../../../../model/kanel/public/Organization';
import {
  ErrorCode,
  NotFoundErrorCode,
} from '../../../../utils/error/error.code';
import { ErrorType } from '../../../../utils/error/error.type';
import { registrationApp } from '../../registration.app';
import registrationResolver from '../../registration.resolver';

describe('query.canUnregisterPlatform', () => {
  it.each`
    description        | organizationId                    | expectedOrgId
    ${'with orgId'}    | ${TEST_ORGANIZATIONS.FILIGRAN.ID} | ${TEST_ORGANIZATIONS.FILIGRAN.ID}
    ${'without orgId'} | ${null}                           | ${undefined}
  `(
    'should return isPlatformRegistered: true $description',
    async ({
      organizationId,
      expectedOrgId,
    }: {
      organizationId: OrganizationId | null;
      expectedOrgId: string | undefined;
    }) => {
      // Given
      const input: CanUnregisterPlatformInput = { platformId: uuidv4() };
      vi.spyOn(registrationApp, 'canUnregisterPlatform').mockResolvedValue({
        isAllowed: organizationId !== null,
        isInOrganization: organizationId !== null,
        organizationId,
      });

      // When
      const result = await registrationResolver.Query!.canUnregisterPlatform!(
        {},
        { input },
        contextSimpleUserFiligran2,
        GRAPHQL_RESOLVE_INFO
      );

      // Then
      expect(result).toMatchObject({
        isPlatformRegistered: true,
        organizationId: expectedOrgId,
      });
    }
  );

  it('should return { isPlatformRegistered: false } when the app throws PlatformNotRegistered', async () => {
    // Given
    const input: CanUnregisterPlatformInput = { platformId: uuidv4() };
    vi.spyOn(registrationApp, 'canUnregisterPlatform').mockRejectedValue(
      new Error(ErrorCode.PlatformNotRegistered)
    );

    // When
    const result = await registrationResolver.Query!.canUnregisterPlatform!(
      {},
      { input },
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    // Then
    expect(result).toMatchObject({ isPlatformRegistered: false });
  });

  it.each`
    errorCode                                      | expectedName                 | description
    ${NotFoundErrorCode.ServiceDefinitionNotFound} | ${ErrorType.NotFound}        | ${'ServiceDefinitionNotFound'}
    ${ErrorCode.UserIsNotInOrganization}           | ${ErrorType.ForbiddenAccess} | ${'UserIsNotInOrganization'}
    ${ErrorCode.InvalidPlatformId}                 | ${ErrorType.BadRequest}      | ${'InvalidPlatformId'}
  `(
    'should map to $expectedName for $description error',
    async ({
      errorCode,
      expectedName,
    }: {
      errorCode: string;
      expectedName: ErrorType;
    }) => {
      // Given
      const input: CanUnregisterPlatformInput = { platformId: uuidv4() };
      vi.spyOn(registrationApp, 'canUnregisterPlatform').mockRejectedValue(
        new Error(errorCode)
      );

      // When
      const call = registrationResolver.Query!.canUnregisterPlatform!(
        {},
        { input },
        contextSimpleUserFiligran2,
        GRAPHQL_RESOLVE_INFO
      );

      // Then
      await expect(call).rejects.toMatchObject({ name: expectedName });
    }
  );
});
