import { v4 as uuidv4 } from 'uuid';
import { describe, expect, it, vi } from 'vitest';
import { GRAPHQL_RESOLVE_INFO } from '../../../../../tests/tests.const';
import {
  AutoRegisterPlatformInput,
  PlatformContract,
} from '../../../../__generated__/resolvers-types';
import { PortalContext } from '../../../../model/portal-context';
import { BadRequestErrorCode } from '../../../../utils/error/error.code';
import { ErrorType } from '../../../../utils/error/error.type';
import { RegistrationApp } from '../../registration.app';
import registrationResolver from '../../registration.resolver';

const makeContext = (token: string | null = null): PortalContext =>
  ({
    req: { header: vi.fn().mockReturnValue(token) },
  }) as unknown as PortalContext;

const validInput: AutoRegisterPlatformInput = {
  platform: {
    id: uuidv4(),
    url: 'http://example.com',
    title: 'My Platform',
    contract: PlatformContract.Ee,
    version: '1.0.0',
  },
};

describe('mutation.autoRegisterPlatform', () => {
  it('should throw BadRequestError when neither input nor platform is provided', async () => {
    const call = registrationResolver.Mutation!.autoRegisterPlatform!(
      {},
      { platform: null, input: null },
      makeContext(),
      GRAPHQL_RESOLVE_INFO
    );

    await expect(call).rejects.toMatchObject({
      name: ErrorType.BadRequest,
      message: BadRequestErrorCode.MissingAutoRegisterPlatformArgument,
    });
  });

  it('should call autoRegisterPlatform with token from header and return success', async () => {
    const token = uuidv4();
    vi.spyOn(RegistrationApp, 'autoRegisterPlatform').mockResolvedValue(
      undefined
    );

    const result = await registrationResolver.Mutation!.autoRegisterPlatform!(
      {},
      { input: validInput, platform: null },
      makeContext(token),
      GRAPHQL_RESOLVE_INFO
    );

    expect(RegistrationApp.autoRegisterPlatform).toHaveBeenCalledWith(
      token,
      validInput
    );
    expect(result).toMatchObject({ success: true });
  });

  it('should use legacy platform arg when input is null', async () => {
    vi.spyOn(RegistrationApp, 'autoRegisterPlatform').mockResolvedValue(
      undefined
    );

    const result = await registrationResolver.Mutation!.autoRegisterPlatform!(
      {},
      { platform: validInput.platform, input: null },
      makeContext(),
      GRAPHQL_RESOLVE_INFO
    );

    expect(RegistrationApp.autoRegisterPlatform).toHaveBeenCalledWith(null, {
      platform: validInput.platform,
    });
    expect(result).toMatchObject({ success: true });
  });

  it('should map to BadRequest for InvalidPlatformIdentifier error', async () => {
    vi.spyOn(RegistrationApp, 'autoRegisterPlatform').mockRejectedValue(
      new Error(BadRequestErrorCode.InvalidPlatformIdentifier)
    );

    const call = registrationResolver.Mutation!.autoRegisterPlatform!(
      {},
      { input: validInput, platform: null },
      makeContext(),
      GRAPHQL_RESOLVE_INFO
    );

    await expect(call).rejects.toMatchObject({ name: ErrorType.BadRequest });
  });
});
