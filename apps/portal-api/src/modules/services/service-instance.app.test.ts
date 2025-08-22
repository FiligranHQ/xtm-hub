import { MockInstance } from '@vitest/spy';
import { v4 as uuidv4 } from 'uuid';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { contextAdminUser } from '../../../tests/tests.const';
import { ServiceInstanceId } from '../../model/kanel/public/ServiceInstance';
import { SubscriptionId } from '../../model/kanel/public/Subscription';
import { UserId } from '../../model/kanel/public/User';
import * as subscriptionDomain from '../subcription/subscription.domain';
import { GenericServiceCapabilityIds } from '../user_service/service-capability/generic_service_capability.const';
import * as userServiceDomain from '../user_service/user_service.domain';
import { serviceInstanceApp } from './service-instance.app';
import * as serviceInstanceDomain from './service-instance.domain';

describe('Service Instance app', () => {
  describe('loadServiceInstance', () => {
    let loadSubscriptionBySpy: MockInstance;
    let loadUserServiceBySpy: MockInstance;
    let loadServiceInstanceBySpy: MockInstance;
    let grantServiceAccessSpy: MockInstance;

    const mockServiceInstanceId = uuidv4() as ServiceInstanceId;
    const mockSubscriptionId = uuidv4() as SubscriptionId;
    const mockUserId = contextAdminUser.user.id;

    const mockSubscription = {
      id: mockSubscriptionId,
      service_instance_id: mockServiceInstanceId,
      organization_id: uuidv4(),
      joining: 'INVITE_ONLY',
      start_date: new Date(),
      end_date: null,
    };

    const mockUserService = {
      id: uuidv4(),
      user_id: mockUserId,
      subscription_id: mockSubscriptionId,
      service_capability_id: GenericServiceCapabilityIds.AccessId,
    };

    const mockServiceInstance = {
      id: mockServiceInstanceId,
      name: 'Service instance 1',
      description: 'description 1',
      service_definition_id: uuidv4(),
      created_at: new Date(),
      updated_at: new Date(),
    };

    beforeEach(() => {
      loadSubscriptionBySpy = vi.spyOn(
        subscriptionDomain,
        'loadSubscriptionBy'
      );
      loadUserServiceBySpy = vi.spyOn(userServiceDomain, 'loadUserServiceBy');
      loadServiceInstanceBySpy = vi.spyOn(
        serviceInstanceDomain,
        'loadServiceInstanceBy'
      );
      grantServiceAccessSpy = vi.spyOn(
        serviceInstanceDomain,
        'grantServiceAccess'
      );
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should load service instance when user already has access', async () => {
      loadSubscriptionBySpy.mockResolvedValueOnce(mockSubscription);
      loadUserServiceBySpy.mockResolvedValueOnce([mockUserService]);
      loadServiceInstanceBySpy.mockResolvedValueOnce(mockServiceInstance);

      const result = await serviceInstanceApp.loadServiceInstance(
        contextAdminUser,
        mockServiceInstanceId
      );

      expect(loadSubscriptionBySpy).toHaveBeenCalledWith(contextAdminUser, {
        service_instance_id: mockServiceInstanceId,
      });
      expect(loadUserServiceBySpy).toHaveBeenCalledWith(contextAdminUser, {
        subscription_id: mockSubscriptionId,
        user_id: mockUserId,
      });
      expect(grantServiceAccessSpy).not.toHaveBeenCalled();
      expect(loadServiceInstanceBySpy).toHaveBeenCalledWith(
        contextAdminUser,
        'id',
        mockServiceInstanceId
      );
      expect(result).toEqual(mockServiceInstance);
    });

    it('should auto-join user when subscription has AUTO_JOIN mode and user has no access', async () => {
      const autoJoinSubscription = {
        ...mockSubscription,
        joining: 'AUTO_JOIN',
      };
      loadSubscriptionBySpy.mockResolvedValue(autoJoinSubscription);
      loadUserServiceBySpy.mockResolvedValue([]);
      loadServiceInstanceBySpy.mockResolvedValue(mockServiceInstance);
      grantServiceAccessSpy.mockResolvedValue(undefined);

      const result = await serviceInstanceApp.loadServiceInstance(
        contextAdminUser,
        mockServiceInstanceId
      );

      expect(grantServiceAccessSpy).toHaveBeenCalledWith(
        contextAdminUser,
        [GenericServiceCapabilityIds.AccessId],
        [mockUserId],
        mockSubscriptionId
      );
      expect(result).toEqual(mockServiceInstance);
    });

    it('should not auto-join user when subscription has INVITE_ONLY mode', async () => {
      const inviteOnlySubscription = {
        ...mockSubscription,
        joining: 'INVITE_ONLY',
      };
      loadSubscriptionBySpy.mockResolvedValue(inviteOnlySubscription);
      loadUserServiceBySpy.mockResolvedValue([]);
      loadServiceInstanceBySpy.mockResolvedValue(mockServiceInstance);

      const result = await serviceInstanceApp.loadServiceInstance(
        contextAdminUser,
        mockServiceInstanceId
      );

      expect(grantServiceAccessSpy).not.toHaveBeenCalled();
      expect(result).toEqual(mockServiceInstance);
    });

    it('should handle multiple user services', async () => {
      const multipleUserServices = [
        mockUserService,
        {
          ...mockUserService,
          id: uuidv4(),
          service_capability_id: uuidv4(),
        },
      ];
      loadSubscriptionBySpy.mockResolvedValue(mockSubscription);
      loadUserServiceBySpy.mockResolvedValue(multipleUserServices);
      loadServiceInstanceBySpy.mockResolvedValue(mockServiceInstance);

      const result = await serviceInstanceApp.loadServiceInstance(
        contextAdminUser,
        mockServiceInstanceId
      );

      expect(grantServiceAccessSpy).not.toHaveBeenCalled();
      expect(result).toEqual(mockServiceInstance);
    });

    it('should propagate errors from loadSubscriptionBy', async () => {
      const error = new Error('Error');
      loadSubscriptionBySpy.mockRejectedValue(error);

      await expect(
        serviceInstanceApp.loadServiceInstance(
          contextAdminUser,
          mockServiceInstanceId
        )
      ).rejects.toThrow('Error');

      expect(loadUserServiceBySpy).not.toHaveBeenCalled();
      expect(loadServiceInstanceBySpy).not.toHaveBeenCalled();
    });

    it('should propagate errors from grantServiceAccess', async () => {
      const autoJoinSubscription = {
        ...mockSubscription,
        joining: 'AUTO_JOIN',
      };
      const error = new Error('Other error');
      loadSubscriptionBySpy.mockResolvedValue(autoJoinSubscription);
      loadUserServiceBySpy.mockResolvedValue([]);
      grantServiceAccessSpy.mockRejectedValue(error);

      await expect(
        serviceInstanceApp.loadServiceInstance(
          contextAdminUser,
          mockServiceInstanceId
        )
      ).rejects.toThrow('Other error');

      expect(loadServiceInstanceBySpy).not.toHaveBeenCalled();
    });

    it('should handle different context users', async () => {
      const differentUserId = uuidv4() as UserId;
      const differentContext = {
        ...contextAdminUser,
        user: {
          ...contextAdminUser.user,
          id: differentUserId,
        },
      };

      loadSubscriptionBySpy.mockResolvedValue(mockSubscription);
      loadUserServiceBySpy.mockResolvedValue([]);
      loadServiceInstanceBySpy.mockResolvedValue(mockServiceInstance);

      await serviceInstanceApp.loadServiceInstance(
        differentContext,
        mockServiceInstanceId
      );

      expect(loadUserServiceBySpy).toHaveBeenCalledWith(differentContext, {
        subscription_id: mockSubscriptionId,
        user_id: differentUserId,
      });
    });
  });
});
