import { toGlobalId } from 'graphql-relay/node/node.js';
import { v4 as uuidv4 } from 'uuid';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  contextSimpleUserFiligran2,
  INFO,
  TEST_ORGANIZATIONS,
} from '../../../../../tests/tests.const';
import {
  PlatformContract,
  PlatformIdentifier,
  RegisterPlatformInput,
} from '../../../../__generated__/resolvers-types';
import { UnknownErrorCode } from '../../../../utils/error/error.code';
import { registrationApp } from '../../registration.app';
import registrationResolver from '../../registration.resolver';

describe('mutation.registerPlatform', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should decode organizationId from global ID before calling registrationApp and return the token', async () => {
    // Given
    const rawOrgId = TEST_ORGANIZATIONS.FILIGRAN.ID;
    const globalOrgId = toGlobalId('Organization', rawOrgId);
    const generatedToken = uuidv4();
    const platformInput = {
      id: uuidv4(),
      url: 'http://example.com',
      title: 'My Platform',
      contract: PlatformContract.Ee,
      version: '1.0.0',
    };
    const input: RegisterPlatformInput = {
      organizationId: globalOrgId,
      platform: platformInput,
      identifier: PlatformIdentifier.Opencti,
    };
    vi.spyOn(registrationApp, 'registerPlatform').mockResolvedValue(
      generatedToken
    );

    // When
    const result = await registrationResolver.Mutation!.registerPlatform!(
      {},
      { input },
      contextSimpleUserFiligran2,
      INFO
    );

    // Then
    expect(registrationApp.registerPlatform).toHaveBeenCalledWith({
      ...input,
      organizationId: rawOrgId,
    });
    expect(result).toMatchObject({ token: generatedToken });
  });

  it('should throw a mapped GraphQL error with RegisterPlatformUnknownError when the app throws', async () => {
    // Given
    const input: RegisterPlatformInput = {
      organizationId: toGlobalId(
        'Organization',
        TEST_ORGANIZATIONS.FILIGRAN.ID
      ),
      platform: {
        id: uuidv4(),
        url: 'http://example.com',
        title: 'My Platform',
        contract: PlatformContract.Ee,
        version: '1.0.0',
      },
      identifier: PlatformIdentifier.Opencti,
    };
    vi.spyOn(registrationApp, 'registerPlatform').mockRejectedValue(
      new Error('UNEXPECTED')
    );

    // When
    const call = registrationResolver.Mutation!.registerPlatform!(
      {},
      { input },
      contextSimpleUserFiligran2,
      INFO
    );

    // Then
    await expect(call).rejects.toThrow(
      UnknownErrorCode.RegisterPlatformUnknownError
    );
  });
});
