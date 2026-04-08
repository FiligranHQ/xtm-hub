import { toGlobalId } from 'graphql-relay/node/node.js';
import { v4 as uuidv4 } from 'uuid';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  contextSimple2,
  INFO,
  TEST_ORGANIZATIONS,
} from '../../../../../tests/tests.const';
import { CanUnregisterPlatformInput } from '../../../../__generated__/resolvers-types';
import { OrganizationId } from '../../../../model/kanel/public/Organization';
import {
  ErrorCode,
  NotFoundErrorCode,
  UnknownErrorCode,
} from '../../../../utils/error/error.code';
import { registrationApp } from '../../registration.app';
import registrationResolver from '../../registration.resolver';

describe('Query.canUnregisterPlatform', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each`
    description        | organizationId                                      | expectedOrgGlobalId
    ${'with orgId'}    | ${TEST_ORGANIZATIONS.FILIGRAN.ID as OrganizationId} | ${toGlobalId('Organization', TEST_ORGANIZATIONS.FILIGRAN.ID)}
    ${'without orgId'} | ${null}                                             | ${undefined}
  `(
    'should return isPlatformRegistered: true $description',
    async ({
      organizationId,
      expectedOrgGlobalId,
    }: {
      organizationId: OrganizationId | null;
      expectedOrgGlobalId: string | undefined;
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
        contextSimple2,
        INFO
      );

      // Then
      expect(result).toMatchObject({
        isPlatformRegistered: true,
        organizationId: expectedOrgGlobalId,
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
      contextSimple2,
      INFO
    );

    // Then
    expect(result).toMatchObject({ isPlatformRegistered: false });
  });

  it.each`
    errorCode                                             | description
    ${NotFoundErrorCode.ServiceDefinitionNotFound}        | ${'ServiceDefinitionNotFound'}
    ${ErrorCode.UserIsNotInOrganization}                  | ${'UserIsNotInOrganization'}
    ${UnknownErrorCode.CanUnregisterPlatformUnknownError} | ${'unknown error'}
  `(
    'should throw a mapped GraphQL error with CanUnregisterPlatformUnknownError for $description',
    async ({ errorCode }: { errorCode: string }) => {
      // Given
      const input: CanUnregisterPlatformInput = { platformId: uuidv4() };
      vi.spyOn(registrationApp, 'canUnregisterPlatform').mockRejectedValue(
        new Error(errorCode)
      );

      // When
      const call = registrationResolver.Query!.canUnregisterPlatform!(
        {},
        { input },
        contextSimple2,
        INFO
      );

      // Then
      await expect(call).rejects.toThrow(errorCode);
    }
  );
});
