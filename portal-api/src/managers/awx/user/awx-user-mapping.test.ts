import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  AWXAddUserInput,
  mapUserInputAWX,
  UserInput,
} from './awx-user-mapping';
import { UserId } from '../../../model/kanel/public/User';
import { OrganizationId } from '../../../model/kanel/public/Organization';
import { ActionTrackingId } from '../../../model/kanel/public/ActionTracking';
import { v4 as uuidv4 } from 'uuid';
import { dbUnsecure } from '../../../../knexfile';
import { Subscription } from '../../../__generated__/resolvers-types';
import UserService, {
  UserServiceId,
  UserServiceInitializer,
} from '../../../model/kanel/public/UserService';
import ServiceCapability, {
  ServiceCapabilityId,
} from '../../../model/kanel/public/ServiceCapability';
import { deleteSubscriptionUnsecure } from '../../../modules/subcription/subscription.helper';
import { SubscriptionId } from '../../../model/kanel/public/Subscription';

describe('Api create-user', async () => {
  beforeAll(async () => {
    // Should add simple service subscription for admin
    const subscriptionData = {
      id: uuidv4(),
      service_id: 'c6343882-f609-4a3f-abe0-a34f8cb11302',
      organization_id: 'ba091095-418f-4b4f-b150-6c9295e232c4',
      start_date: new Date(),
      end_date: undefined,
      billing: 100,
      status: 'ACCEPTED',
    };
    const [addedSubscription] = await dbUnsecure<Subscription>('Subscription')
      .insert(subscriptionData)
      .returning('*');
    const dataUserService: UserServiceInitializer = {
      id: uuidv4() as UserServiceId,
      user_id: 'ba091095-418f-4b4f-b150-6c9295e232c3' as UserId,
      subscription_id: addedSubscription.id as SubscriptionId,
    };
    const [userService] = await dbUnsecure<UserService>('User_Service')
      .insert(dataUserService)
      .returning('*');
    const capabilities = [
      'ACCESS_SERVICE',
      'MANAGE_ACCESS',
      'ADMIN_SUBSCRIPTION',
    ];
    const dataCapabilities = capabilities.map((capability) => ({
      id: uuidv4() as ServiceCapabilityId,
      user_service_id: userService.id,
      service_capability_name: capability,
    }));
    await dbUnsecure<ServiceCapability>('Service_Capability')
      .insert(dataCapabilities)
      .returning('*');
  });

  it('Should return correct mapping with basic data', async () => {
    const expectedResult: AWXAddUserInput = {
      awx_client_request_id:
        'f9d44cd9-ee4f-48af-ac8f-544c6022106c' as ActionTrackingId,
      organization_name: 'Thales',
      user_email_address: 'test@email.com',
      user_firstname: 'firstname',
      user_lastname: 'lastname',
      user_reset_password: 'temporaryPassword',
      user_role_admin_ptf: 'false',
    };

    const user: UserInput = {
      roles: ['40cfe630-c272-42f9-8fcf-f219e2f4277b'],
      id: '681fb117-e2c3-46d3-945a-0e921b5d4b3a' as UserId,
      email: 'test@email.com',
      organization_id: '681fb117-e2c3-46d3-945a-0e921b5d4b6c' as OrganizationId,
      salt: '123',
      password: '123',
      first_name: 'firstname',
      last_name: 'lastname',
    };
    const result = await mapUserInputAWX(
      user,
      'f9d44cd9-ee4f-48af-ac8f-544c6022106c' as ActionTrackingId
    );
    expect(result).toEqual(expectedResult);
  });

  it('should return correct mapping with ADMIN_PTF and subscriptions (services and commu)', async () => {
    const expectedResult: AWXAddUserInput = {
      awx_client_request_id:
        'f9d44cd9-ee4f-48af-ac8f-544c6022104c' as ActionTrackingId,
      organization_name: 'Internal',
      user_email_address: 'admin@filigran.io',
      user_firstname: '',
      user_lastname: '',
      user_role_admin_ptf: 'true',
      user_reset_password: 'temporaryPassword',
      user_subscription_list: JSON.stringify([
        'c6343882-f609-4a3f-abe0-a34f8cb11302',
      ]),
      user_community_list: JSON.stringify([
        { community_id: '575d37c8-53ed-4c63-ae86-2d8d10f14eaf', role: 'admin' },
      ]),
    };

    const user: UserInput = {
      roles: ['6b632cf2-9105-46ec-a463-ad59ab58c770'],
      id: 'ba091095-418f-4b4f-b150-6c9295e232c3' as UserId,
      email: 'admin@filigran.io',
      organization_id: 'ba091095-418f-4b4f-b150-6c9295e232c4' as OrganizationId,
      salt: 'b22f0133be79a6aa5da8f606f395fdd1',
      password:
        'd088109c8844877c826bfd1898a327d9aca7c40009061180dd0f342156b4247bd943571f1a04253062f8a1b1159d282c531c957a033b059c94a059e09af4e11d',
      first_name: '',
      last_name: '',
    };
    const result = await mapUserInputAWX(
      user,
      'f9d44cd9-ee4f-48af-ac8f-544c6022104c' as ActionTrackingId
    );
    expect(result).toEqual(expectedResult);
  });

  it.skip('Should return correct mapping with adminPTF', async () => {
    const expectedResult: AWXAddUserInput = {
      awx_client_request_id:
        'f9d44cd9-ee4f-48af-ac8f-544c6022105c' as ActionTrackingId,
      organization_name: 'Internal',
      user_email_address: 'admin@filigran.io',
      user_firstname: '',
      user_lastname: '',
      user_role_admin_ptf: 'true',
      user_community_list: JSON.stringify([
        { community_id: '575d37c8-53ed-4c63-ae86-2d8d10f14eaf', role: 'admin' },
      ]),
    };

    const user: UserInput = {
      roles: ['6b632cf2-9105-46ec-a463-ad59ab58c770'],
      id: 'ba091095-418f-4b4f-b150-6c9295e232c3' as UserId,
      email: 'admin@filigran.io',
      organization_id: 'ba091095-418f-4b4f-b150-6c9295e232c4' as OrganizationId,
      salt: 'b22f0133be79a6aa5da8f606f395fdd1',
      password:
        'd088109c8844877c826bfd1898a327d9aca7c40009061180dd0f342156b4247bd943571f1a04253062f8a1b1159d282c531c957a033b059c94a059e09af4e11d',
      first_name: '',
      last_name: '',
    };
    const result = await mapUserInputAWX(
      user,
      'f9d44cd9-ee4f-48af-ac8f-544c6022105c' as ActionTrackingId
    );
    expect(result).toEqual(expectedResult);
  });

  afterAll(async () => {
    await deleteSubscriptionUnsecure('c6343882-f609-4a3f-abe0-a34f8cb11302');
  });
});
