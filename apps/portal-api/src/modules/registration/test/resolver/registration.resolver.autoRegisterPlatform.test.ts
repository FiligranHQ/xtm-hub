import { v4 as uuidv4 } from 'uuid';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  contextSimpleUserFiligran2,
  INFO,
} from '../../../../../tests/tests.const';
import {
  AutoRegisterPlatformInput,
  PlatformContract,
} from '../../../../__generated__/resolvers-types';
import { BadRequestErrorCode } from '../../../../utils/error/error.code';
import { ErrorType } from '../../../../utils/error/error.type';
import { registrationApp } from '../../registration.app';
import registrationResolver from '../../registration.resolver';

const makeContext = (token: string | null = null) => ({
  ...contextSimpleUserFiligran2,
  req: { header: vi.fn().mockReturnValue(token) },
});

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
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should throw BadRequestError when neither input nor platform is provided', async () => {
    const call = registrationResolver.Mutation!.autoRegisterPlatform!(
      {},
      { platform: null, input: null },
      makeContext() as never,
      INFO
    );

    await expect(call).rejects.toMatchObject({
      name: ErrorType.BadRequest,
      message: BadRequestErrorCode.MissingAutoRegisterPlatformArgument,
    });
  });

  it('should call autoRegisterPlatform with token from header and return success', async () => {
    const token = uuidv4();
    vi.spyOn(registrationApp, 'autoRegisterPlatform').mockResolvedValue(
      undefined
    );

    const result = await registrationResolver.Mutation!.autoRegisterPlatform!(
      {},
      { input: validInput, platform: null },
      makeContext(token) as never,
      INFO
    );

    expect(registrationApp.autoRegisterPlatform).toHaveBeenCalledWith(
      token,
      validInput
    );
    expect(result).toMatchObject({ success: true });
  });

  it('should use legacy platform arg when input is null', async () => {
    vi.spyOn(registrationApp, 'autoRegisterPlatform').mockResolvedValue(
      undefined
    );

    const result = await registrationResolver.Mutation!.autoRegisterPlatform!(
      {},
      { platform: validInput.platform, input: null },
      makeContext() as never,
      INFO
    );

    expect(registrationApp.autoRegisterPlatform).toHaveBeenCalledWith(null, {
      platform: validInput.platform,
    });
    expect(result).toMatchObject({ success: true });
  });

  it('should map to BadRequest for InvalidPlatformIdentifier error', async () => {
    vi.spyOn(registrationApp, 'autoRegisterPlatform').mockRejectedValue(
      new Error(BadRequestErrorCode.InvalidPlatformIdentifier)
    );

    const call = registrationResolver.Mutation!.autoRegisterPlatform!(
      {},
      { input: validInput, platform: null },
      makeContext() as never,
      INFO
    );

    await expect(call).rejects.toMatchObject({ name: ErrorType.BadRequest });
  });
});
