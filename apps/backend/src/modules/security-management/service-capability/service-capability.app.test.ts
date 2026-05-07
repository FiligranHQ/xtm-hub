import { v4 as uuidv4 } from 'uuid';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { TestHelper } from '../../../../tests/helper/test.helper';
import {
  // eslint-disable-next-line no-restricted-imports
  requestContextAdminUser,
  requestContextSimpleUserSecondOrga,
  SERVICES,
} from '../../../../tests/tests.const';
import { ServiceRestriction } from '../../../__generated__/resolvers-types';
import { requestContext } from '../../../context/request.context';
import Subscription, {
  SubscriptionId,
} from '../../../model/kanel/public/Subscription';
import { createSubscription } from '../../subscription/subscription.domain';
import { UserServiceDomain } from '../../user-service/user-service.domain';
import { loadCapabilities } from '../user-service-capability/user-service-capability.helper';
import { serviceCapabilityApp } from './service-capability.app';

describe('editServiceCapability', () => {
  let subscription: Subscription;
  beforeEach(async () => {
    subscription = await createSubscription({
      id: uuidv4() as SubscriptionId,
      service_instance_id: SERVICES.INSTANCES.VAULT.ID,
      organization_id:
        requestContextSimpleUserSecondOrga.user.selected_organization_id,
      start_date: new Date(),
      end_date: undefined,
    });
  });
  afterEach(async () => {
    await TestHelper.user_ServiceCapability.delete({});
    await TestHelper.user_Service.delete({
      subscription_id: subscription.id,
    });
  });
  it('should update capability', async () => {
    requestContext.set(requestContextAdminUser);
    const userService = await UserServiceDomain.createUserServiceAccess({
      subscription_id: subscription.id,
      user_id: requestContextSimpleUserSecondOrga.user.id,
      capabilities: [ServiceRestriction.Access],
    });

    const editedCapa = await serviceCapabilityApp.editServiceCapability(
      userService!.id,
      [ServiceRestriction.Access, ServiceRestriction.ManageAccess],
      SERVICES.INSTANCES.VAULT.ID
    );

    const capabilities = await loadCapabilities(
      SERVICES.INSTANCES.VAULT.ID,
      requestContextSimpleUserSecondOrga.user.id,
      requestContextSimpleUserSecondOrga.user.selected_organization_id
    );

    expect(editedCapa).toBeTruthy();
    expect(capabilities).toStrictEqual([
      ServiceRestriction.Access,
      ServiceRestriction.ManageAccess,
    ]);
  });
  it('should throw an error if user is not allowed', async () => {
    const userService = await UserServiceDomain.createUserServiceAccess({
      subscription_id: subscription.id,
      user_id: requestContextSimpleUserSecondOrga.user.id,
      capabilities: [ServiceRestriction.Access],
    });

    requestContext.set(requestContextSimpleUserSecondOrga);

    const call = serviceCapabilityApp.editServiceCapability(
      userService!.id,
      [ServiceRestriction.Access, ServiceRestriction.ManageAccess],
      SERVICES.INSTANCES.VAULT.ID
    );

    await expect(call).rejects.toThrow('MISSING_CAPABILITY_ON_SERVICE');
  });
});
