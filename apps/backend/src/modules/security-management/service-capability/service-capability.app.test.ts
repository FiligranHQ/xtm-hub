import { afterEach, describe, expect, it, vi } from 'vitest';
import { SERVICES, TEST_ORGANIZATIONS } from '../../../../tests/tests.const';
import { requestContext } from '../../../context/request.context';
import { SubscriptionDomain } from '../../subscription/subscription.domain';
import { ServiceCapabilityApp } from './service-capability.app';
import { ServiceCapabilityDomain } from './service-capability.domain';

describe('serviceCapability app', () => {
  const serviceInstanceId = SERVICES.INSTANCES.EPIC.ID;
  const userId = TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.SIMPLE.ID;
  const selectedOrganizationId = TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID;
  const subscriptionId = 'subscription-id';
  const keptUserServiceId = 'user-service-id-kept';

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should delegate to domain and keep only capabilities with non-null user_service_id', async () => {
    // Given
    vi.spyOn(requestContext, 'requireUser').mockReturnValue({
      id: userId,
      selected_organization_id: selectedOrganizationId,
    } as unknown as ReturnType<typeof requestContext.requireUser>);
    vi.spyOn(
      ServiceCapabilityDomain,
      'loadServiceCapabilitiesByServiceId'
    ).mockResolvedValue([
      {
        id: 'capability-id-1',
        user_service_id: null,
        generic_service_capability: null,
        subscription_capability: null,
      },
      {
        id: 'capability-id-2',
        user_service_id: keptUserServiceId,
        generic_service_capability: null,
        subscription_capability: null,
      },
    ]);
    vi.spyOn(SubscriptionDomain, 'loadSubscriptionBy').mockResolvedValue({
      id: subscriptionId,
    } as Awaited<ReturnType<typeof SubscriptionDomain.loadSubscriptionBy>>);

    // When
    const result =
      await ServiceCapabilityApp.loadServiceCapabilitiesByServiceId(
        serviceInstanceId
      );

    // Then
    expect(
      ServiceCapabilityDomain.loadServiceCapabilitiesByServiceId
    ).toHaveBeenCalledWith(serviceInstanceId, userId);
    expect(SubscriptionDomain.loadSubscriptionBy).toHaveBeenCalledWith({
      service_instance_id: serviceInstanceId,
      organization_id: selectedOrganizationId,
    });
    expect(result).toEqual({
      subscription_id: subscriptionId,
      userServiceCapabilities: [
        expect.objectContaining({
          id: 'capability-id-2',
          user_service_id: keptUserServiceId,
        }),
      ],
    });
  });

  it('should propagate domain error when loading capabilities fails', async () => {
    // Given
    const domainError = new Error('Domain failure');
    vi.spyOn(requestContext, 'requireUser').mockReturnValue({
      id: userId,
      selected_organization_id: selectedOrganizationId,
    } as unknown as ReturnType<typeof requestContext.requireUser>);
    vi.spyOn(
      ServiceCapabilityDomain,
      'loadServiceCapabilitiesByServiceId'
    ).mockRejectedValue(domainError);

    // When
    const call =
      ServiceCapabilityApp.loadServiceCapabilitiesByServiceId(
        serviceInstanceId
      );

    // Then
    await expect(call).rejects.toThrow('Domain failure');
  });
});
