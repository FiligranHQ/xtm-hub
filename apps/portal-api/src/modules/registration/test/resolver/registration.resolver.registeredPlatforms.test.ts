import { toGlobalId } from 'graphql-relay/node/node.js';
import { v4 as uuidv4 } from 'uuid';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { contextSimple2, INFO } from '../../../../../tests/tests.const';
import {
  PlatformIdentifier,
  RegisteredPlatform,
  RegisteredPlatformsInput,
} from '../../../../__generated__/resolvers-types';
import { ServiceInstanceId } from '../../../../model/kanel/public/ServiceInstance';
import { registrationApp } from '../../registration.app';
import registrationResolver from '../../registration.resolver';

describe('Query.registeredPlatform', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should decode the service_instance_id from global ID and pass the raw UUID to registrationApp', async () => {
    // Given
    const rawId = uuidv4() as ServiceInstanceId;
    const globalId = toGlobalId('ServiceInstance', rawId);
    const expectedPlatform = { id: rawId, title: 'My Platform' };
    vi.spyOn(registrationApp, 'loadRegisteredPlatform').mockResolvedValue(
      expectedPlatform as unknown as RegisteredPlatform
    );

    // When
    const result = await registrationResolver.Query!.registeredPlatform!(
      {},
      { input: { service_instance_id: globalId } },
      contextSimple2,
      INFO
    );

    // Then
    expect(registrationApp.loadRegisteredPlatform).toHaveBeenCalledWith(rawId);
    expect(result).toMatchObject({ id: rawId, title: 'My Platform' });
  });
});

describe('Query.registeredPlatforms', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should pass the input directly to registrationApp and return its result', async () => {
    // Given
    const input: RegisteredPlatformsInput = {
      identifier: PlatformIdentifier.Opencti,
      onlyActive: true,
      onlyTrial: false,
    };
    const platforms = [{ id: uuidv4(), title: 'Platform A' }];
    vi.spyOn(registrationApp, 'loadRegisteredPlatforms').mockResolvedValue(
      platforms as unknown as RegisteredPlatform[]
    );

    // When
    const result = await registrationResolver.Query!.registeredPlatforms!(
      {},
      { input },
      contextSimple2,
      INFO
    );

    // Then
    expect(registrationApp.loadRegisteredPlatforms).toHaveBeenCalledWith(input);
    expect(result).toEqual(platforms);
  });
});
