import { describe, expect, it, vi } from 'vitest';
import {
  contextSimpleUserFiligran2,
  GRAPHQL_RESOLVE_INFO,
  SERVICES,
} from '../../../tests/tests.const';
import {
  OneClickDeployInput,
  PlatformIdentifier,
} from '../../__generated__/resolvers-types';
import { UserId } from '../../model/kanel/public/User';
import { logApp } from '../../utils/app-logger.util';
import { telemetryApp } from './telemetry.app';
import telemetryResolver from './telemetry.resolver';

const buildInput = (): OneClickDeployInput => ({
  service_instance_id: SERVICES.INSTANCES.INTEGRATIONS.ID,
  platform_service_instance_id: SERVICES.INSTANCES.EPIC.ID,
  resource_id: 'resource-1',
  resource_title: 'My Resource',
  platform_identifier: PlatformIdentifier.Opencti,
});

describe('send telemetry event GraphQL mutation', () => {
  it('should return empty object as placeholder', () => {
    // Given / When
    const result = telemetryResolver.Mutation!.sendTelemetryEvent!(
      {},
      {},
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    // Then
    expect(result).toMatchObject({});
  });
});

describe('one click deploy GraphQL mutation', () => {
  it('should call telemetryApp.sendOneClickDeployEvent and return result true on success', async () => {
    // Given
    const input = buildInput();
    vi.spyOn(telemetryApp, 'sendOneClickDeployEvent').mockResolvedValue(
      undefined
    );

    // When
    const result = await telemetryResolver.SendTelemetryMutation!
      .oneClickDeploy!(
      {},
      { input },
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    // Then
    expect(telemetryApp.sendOneClickDeployEvent).toHaveBeenCalledWith({
      userId: contextSimpleUserFiligran2.user.id as UserId,
      input,
    });
    expect(result).toMatchObject({ result: true });
  });

  it('should call logApp.error and return result false with message on error', async () => {
    // Given
    const errorMessage = 'Telemetry service unavailable';
    const input = buildInput();
    vi.spyOn(telemetryApp, 'sendOneClickDeployEvent').mockRejectedValue(
      new Error(errorMessage)
    );
    vi.spyOn(logApp, 'error').mockImplementation(() => undefined);

    // When
    const result = await telemetryResolver.SendTelemetryMutation!
      .oneClickDeploy!(
      {},
      { input },
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    // Then
    expect(logApp.error).toHaveBeenCalledWith(
      'Error in sendTelemetryEvent resolver',
      expect.objectContaining({ error: expect.any(Error) })
    );
    expect(result).toMatchObject({ result: false, message: errorMessage });
  });

  it('should return default message when error has no message', async () => {
    // Given
    const input = buildInput();
    const errorWithNoMessage = new Error();
    errorWithNoMessage.message = '';
    vi.spyOn(telemetryApp, 'sendOneClickDeployEvent').mockRejectedValue(
      errorWithNoMessage
    );
    vi.spyOn(logApp, 'error').mockImplementation(() => undefined);

    // When
    const result = await telemetryResolver.SendTelemetryMutation!
      .oneClickDeploy!(
      {},
      { input },
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    // Then
    expect(result).toMatchObject({
      result: false,
      message: 'An error occurred while processing sendTelemetryEvent',
    });
  });
});
