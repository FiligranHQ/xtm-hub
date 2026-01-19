import { v4 as uuidv4 } from 'uuid';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { db } from '../../../../knexfile';
import {
  requestContextSimpleUserThales,
  SERVICE_VAULT_ID,
} from '../../../../tests/tests.const';
import { requestContext } from '../../../context/request.context';
import Subscription, {
  SubscriptionId,
} from '../../../model/kanel/public/Subscription';
import UserService from '../../../model/kanel/public/UserService';
import UserServiceCapability from '../../../model/kanel/public/UserServiceCapability';
import { createSubscription } from '../../subcription/subscription.domain';
import { SubscriptionStatus } from '../../subscription.const';
import { loadCapabilities } from '../user-service-capability/user-service-capability.helper';
import { UserServiceDomain } from '../user_service.domain';
import { GenericServiceCapabilityName } from './generic_service_capability.const';
import { serviceCapabilityApp } from './service-capability.app';

describe('editServiceCapability', () => {
  let subscription: Subscription;
  beforeEach(async () => {
    subscription = await createSubscription({
      id: uuidv4() as SubscriptionId,
      service_instance_id: SERVICE_VAULT_ID,
      organization_id:
        requestContextSimpleUserThales.user.selected_organization_id,
      start_date: new Date(),
      end_date: undefined,
      billing: 100,
      status: SubscriptionStatus.ACCEPTED,
    });
  });
  afterEach(async () => {
    await db<UserServiceCapability>('UserService_Capability').del();
    await db<UserService>('User_Service').del();
  });
  it('should update capability', async () => {
    const userService = await UserServiceDomain.createUserServiceAccess({
      subscription_id: subscription.id,
      user_id: requestContextSimpleUserThales.user.id,
      capabilities: [GenericServiceCapabilityName.ACCESS],
    });

    const editedCapa = await serviceCapabilityApp.editServiceCapability(
      userService!.id,
      [
        GenericServiceCapabilityName.ACCESS,
        GenericServiceCapabilityName.MANAGE_ACCESS,
      ],
      SERVICE_VAULT_ID
    );

    const capabilities = await loadCapabilities(
      SERVICE_VAULT_ID,
      requestContextSimpleUserThales.user.id,
      requestContextSimpleUserThales.user.selected_organization_id
    );

    expect(editedCapa).toBeTruthy();
    expect(capabilities).toStrictEqual([
      GenericServiceCapabilityName.ACCESS,
      GenericServiceCapabilityName.MANAGE_ACCESS,
    ]);
  });
  it('should throw an error if user is not allowed', async () => {
    const userService = await UserServiceDomain.createUserServiceAccess({
      subscription_id: subscription.id,
      user_id: requestContextSimpleUserThales.user.id,
      capabilities: [GenericServiceCapabilityName.ACCESS],
    });

    requestContext.set(requestContextSimpleUserThales);

    const call = serviceCapabilityApp.editServiceCapability(
      userService!.id,
      [
        GenericServiceCapabilityName.ACCESS,
        GenericServiceCapabilityName.MANAGE_ACCESS,
      ],
      SERVICE_VAULT_ID
    );

    await expect(call).rejects.toThrow('MISSING_CAPABILITY_ON_SERVICE');
  });
});
