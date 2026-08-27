import { describe, expect, it, vi } from 'vitest';
import {
  contextSimpleUserFiligran2,
  GRAPHQL_RESOLVE_INFO,
  SERVICES,
} from '../../../../tests/tests.const';
import { ServiceCapabilityApp } from './service-capability.app';
import serviceCapabilityResolver from './service-capability.resolver';

describe('userServiceCapabilities GraphQL query', () => {
  it('should delegate to ServiceCapabilityApp.loadServiceCapabilitiesByServiceId when called with service_instance_id', async () => {
    // Given
    const serviceInstanceId = SERVICES.INSTANCES.EPIC.ID;
    const expected = [] as unknown as Awaited<
      ReturnType<typeof ServiceCapabilityApp.loadServiceCapabilitiesByServiceId>
    >;
    vi.spyOn(
      ServiceCapabilityApp,
      'loadServiceCapabilitiesByServiceId'
    ).mockResolvedValue(expected);

    // When
    const response = await serviceCapabilityResolver.Query!
      .userServiceCapabilities!(
      {},
      { service_instance_id: serviceInstanceId },
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    // Then
    expect(
      ServiceCapabilityApp.loadServiceCapabilitiesByServiceId
    ).toHaveBeenCalledWith(serviceInstanceId);
    expect(response).toEqual(expected);
  });
});
