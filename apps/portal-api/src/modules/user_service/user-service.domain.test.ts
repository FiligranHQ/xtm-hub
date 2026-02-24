import { v4 as uuidv4 } from 'uuid';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '../../../knexfile';
import { SERVICES, TEST_ORGANIZATIONS } from '../../../tests/tests.const';
import { SubscriptionId } from '../../model/kanel/public/Subscription';
import User from '../../model/kanel/public/User';
import UserService from '../../model/kanel/public/UserService';
import UserServiceCapability from '../../model/kanel/public/UserServiceCapability';
import * as mailService from '../../server/mail-service';
import { createSubscription } from '../subcription/subscription.domain';
import { SubscriptionStatus } from '../subscription.const';
import { loadUserBy } from '../users/users.domain';
import { removeUser } from '../users/users.helper';
import {
  GenericServiceCapabilityIds,
  GenericServiceCapabilityName,
} from './service-capability/generic_service_capability.const';
import { UserServiceDomain } from './user_service.domain';

async function cleanupUserServices(subscriptionId: SubscriptionId) {
  // Capabilities must be deleted before User_Service due to FK constraints
  const userServices = await db<UserService[]>('User_Service')
    .where('subscription_id', subscriptionId)
    .select('*');

  if (userServices.length > 0) {
    const ids = userServices.map((us) => us.id);
    await db<UserServiceCapability>('UserService_Capability')
      .whereIn('user_service_id', ids)
      .delete();
  }

  await db<UserService>('User_Service')
    .where('subscription_id', subscriptionId)
    .delete();
}

describe('UserServiceDomain', () => {
  describe('addServiceToUsers', () => {
    let subscriptionId: SubscriptionId;

    beforeEach(async () => {
      vi.spyOn(mailService, 'sendMail').mockResolvedValue(undefined);

      subscriptionId = uuidv4() as SubscriptionId;
      await createSubscription({
        id: subscriptionId,
        service_instance_id: SERVICES.INSTANCES.VAULT.ID,
        organization_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        start_date: new Date(),
        end_date: undefined,
        billing: 0,
        status: SubscriptionStatus.ACCEPTED,
      });
    });

    afterEach(async () => {
      vi.restoreAllMocks();
      await cleanupUserServices(subscriptionId);
      await db('Subscription').where('id', subscriptionId).delete();
    });

    it('should create a UserService record for an existing user in the organization', async () => {
      const email = TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.SIMPLE.EMAIL;
      const userId = TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.SIMPLE.ID;

      const subscription = await db('Subscription')
        .where('id', subscriptionId)
        .first();

      const result = await UserServiceDomain.addServiceToUsers(
        subscription,
        [email],
        [GenericServiceCapabilityName.ACCESS]
      );

      expect(result).toHaveLength(1);
      expect(result[0]!.subscription_id).toBe(subscriptionId);
      expect(result[0]!.user_id).toBe(userId);

      const persisted = await db<UserService>('User_Service')
        .where({ id: result[0]!.id })
        .first();
      expect(persisted).toBeDefined();
      expect(persisted!.subscription_id).toBe(subscriptionId);
    });

    it('should still create a UserService and add the ACCESS capability when capabilities array is empty', async () => {
      const email = TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.SIMPLE.EMAIL;

      const subscription = await db('Subscription')
        .where('id', subscriptionId)
        .first();

      const result = await UserServiceDomain.addServiceToUsers(
        subscription,
        [email],
        []
      );

      expect(result).toHaveLength(1);

      const capabilities: { generic_id: string }[] =
        await db<UserServiceCapability>('UserService_Capability')
          .where('user_service_id', result[0]!.id)
          .leftJoin(
            'Generic_Service_Capability',
            'UserService_Capability.generic_service_capability_id',
            '=',
            'Generic_Service_Capability.id'
          )
          .select('Generic_Service_Capability.id as generic_id');

      expect(
        capabilities.some(
          (c) => c.generic_id === GenericServiceCapabilityIds.AccessId
        )
      ).toBe(true);
    });

    it('should create UserService records for multiple users in a single call', async () => {
      const email1 = TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.SIMPLE.EMAIL;
      const email2 =
        TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.ADMIN_ORGA.EMAIL;

      const subscription = await db('Subscription')
        .where('id', subscriptionId)
        .first();

      const result = await UserServiceDomain.addServiceToUsers(
        subscription,
        [email1, email2],
        [GenericServiceCapabilityName.ACCESS]
      );

      expect(result).toHaveLength(2);

      const userServiceIds = result.map((us) => us.id);
      const persisted = await db<UserService[]>('User_Service')
        .whereIn('id', userServiceIds)
        .select('*');

      expect(persisted).toHaveLength(2);

      const subscriptionIds = persisted.map((us) => us.subscription_id);
      expect(subscriptionIds.every((sid) => sid === subscriptionId)).toBe(true);
    });

    it('should return an empty array and create no DB records when emails list is empty', async () => {
      const subscription = await db('Subscription')
        .where('id', subscriptionId)
        .first();

      const result = await UserServiceDomain.addServiceToUsers(
        subscription,
        [],
        [GenericServiceCapabilityName.ACCESS]
      );

      expect(result).toHaveLength(0);
      expect(result).toEqual([]);

      const userServices = await db<UserService>('User_Service')
        .where('subscription_id', subscriptionId)
        .select('*');

      expect(userServices).toHaveLength(0);
    });

    it('should skip users that already have a UserService for the subscription', async () => {
      const email = TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.SIMPLE.EMAIL;
      const subscription = await db('Subscription')
        .where('id', subscriptionId)
        .first();

      // First call creates the UserService
      const firstResult = await UserServiceDomain.addServiceToUsers(
        subscription,
        [email],
        [GenericServiceCapabilityName.ACCESS]
      );

      expect(firstResult).toHaveLength(1);

      // Second call for the same user should return an empty array (user service
      // already exists; doesUserServiceExist returns true)
      const secondResult = await UserServiceDomain.addServiceToUsers(
        subscription,
        [email],
        [GenericServiceCapabilityName.ACCESS]
      );

      expect(secondResult).toHaveLength(0);

      // Only one User_Service row should exist in the DB
      const allUserServices = await db<UserService>('User_Service')
        .where({ subscription_id: subscriptionId })
        .select('*');

      expect(allUserServices).toHaveLength(1);
    });

    it('should only return newly created UserService records when some users already have access', async () => {
      const email1 = TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.SIMPLE.EMAIL;
      const email2 =
        TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.ADMIN_ORGA.EMAIL;

      const subscription = await db('Subscription')
        .where('id', subscriptionId)
        .first();

      // Seed: add email1 first
      await UserServiceDomain.addServiceToUsers(
        subscription,
        [email1],
        [GenericServiceCapabilityName.ACCESS]
      );

      // Now add both; only email2 should come back as newly created
      const result = await UserServiceDomain.addServiceToUsers(
        subscription,
        [email1, email2],
        [GenericServiceCapabilityName.ACCESS]
      );

      expect(result).toHaveLength(1);

      const user2 = await loadUserBy({ email: email2 });
      expect(result[0]!.user_id).toBe(user2.id);
    });

    it('should create a new User record for a previously unknown email in the org domain', async () => {
      // Use a unique email within the second-orga domain so the domain check passes
      const newEmail = `new-user-${uuidv4()}@second-orga.com`;

      const subscription = await db('Subscription')
        .where('id', subscriptionId)
        .first();

      const result = await UserServiceDomain.addServiceToUsers(
        subscription,
        [newEmail],
        [GenericServiceCapabilityName.ACCESS]
      );

      expect(result).toHaveLength(1);

      const createdUser = await loadUserBy({ email: newEmail });
      expect(createdUser).toBeDefined();
      expect(createdUser.email).toBe(newEmail);
      expect(result[0]!.user_id).toBe(createdUser.id);

      // Cleanup the dynamically-created user and its personal-space organization
      await cleanupUserServices(subscriptionId);
      await removeUser({ email: newEmail });
    });

    it('should reuse an existing user when the email already exists in the DB', async () => {
      const existingEmail =
        TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.SIMPLE.EMAIL;
      const existingUserId =
        TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.SIMPLE.ID;

      const subscription = await db('Subscription')
        .where('id', subscriptionId)
        .first();

      const result = await UserServiceDomain.addServiceToUsers(
        subscription,
        [existingEmail],
        [GenericServiceCapabilityName.ACCESS]
      );

      expect(result).toHaveLength(1);
      expect(result[0]!.user_id).toBe(existingUserId);

      // Confirm no duplicate user was created
      const usersWithSameEmail = await db<User>('User')
        .where('email', existingEmail)
        .select('id');

      expect(usersWithSameEmail).toHaveLength(1);
    });

    it('should persist UserService_Capability rows including the ACCESS generic capability', async () => {
      const email = TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.SIMPLE.EMAIL;

      const subscription = await db('Subscription')
        .where('id', subscriptionId)
        .first();

      const result = await UserServiceDomain.addServiceToUsers(
        subscription,
        [email],
        [GenericServiceCapabilityName.ACCESS]
      );

      expect(result).toHaveLength(1);

      const capabilities = await db<UserServiceCapability[]>(
        'UserService_Capability'
      )
        .where('user_service_id', result[0]!.id)
        .select('*');

      expect(capabilities.length).toBeGreaterThan(0);

      const hasAccess = capabilities.some(
        (c) =>
          c.generic_service_capability_id ===
          GenericServiceCapabilityIds.AccessId
      );
      expect(hasAccess).toBe(true);
    });

    it('should persist MANAGE_ACCESS capability when included in the capabilities array', async () => {
      const email = TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.SIMPLE.EMAIL;

      const subscription = await db('Subscription')
        .where('id', subscriptionId)
        .first();

      const result = await UserServiceDomain.addServiceToUsers(
        subscription,
        [email],
        [GenericServiceCapabilityName.MANAGE_ACCESS]
      );

      expect(result).toHaveLength(1);

      const capabilities = await db<UserServiceCapability[]>(
        'UserService_Capability'
      )
        .where('user_service_id', result[0]!.id)
        .select('*');

      const hasManageAccess = capabilities.some(
        (c) =>
          c.generic_service_capability_id ===
          GenericServiceCapabilityIds.ManageAccessId
      );
      expect(hasManageAccess).toBe(true);
    });

    it('should throw a GraphQL error when an email domain does not match the subscription organization', async () => {
      // filigran.io domain does not belong to SECOND_ORGANIZATION
      const outsiderEmail = `outsider-${uuidv4()}@filigran.io`;

      const subscription = await db('Subscription')
        .where('id', subscriptionId)
        .first();

      const call = UserServiceDomain.addServiceToUsers(
        subscription,
        [outsiderEmail],
        [GenericServiceCapabilityName.ACCESS]
      );

      await expect(call).rejects.toThrow(
        'The email address does not correspond to the current organization'
      );

      const userServices = await db<UserService>('User_Service')
        .where('subscription_id', subscriptionId)
        .select('*');

      expect(userServices).toHaveLength(0);
    });

    it('should call sendMail once per newly created UserService', async () => {
      const email1 = TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.SIMPLE.EMAIL;
      const email2 =
        TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.ADMIN_ORGA.EMAIL;

      const subscription = await db('Subscription')
        .where('id', subscriptionId)
        .first();

      await UserServiceDomain.addServiceToUsers(
        subscription,
        [email1, email2],
        [GenericServiceCapabilityName.ACCESS]
      );

      expect(mailService.sendMail).toHaveBeenCalledTimes(2);
    });

    it('should not call sendMail when the user already has access (service already exists)', async () => {
      const email = TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.SIMPLE.EMAIL;
      const subscription = await db('Subscription')
        .where('id', subscriptionId)
        .first();

      // First call – creates the user service
      await UserServiceDomain.addServiceToUsers(
        subscription,
        [email],
        [GenericServiceCapabilityName.ACCESS]
      );

      vi.clearAllMocks();
      vi.spyOn(mailService, 'sendMail').mockResolvedValue(undefined);

      // Second call – skipped because user service already exists
      await UserServiceDomain.addServiceToUsers(
        subscription,
        [email],
        [GenericServiceCapabilityName.ACCESS]
      );

      expect(mailService.sendMail).not.toHaveBeenCalled();
    });

    it('should return UserService objects with the correct shape', async () => {
      const email = TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.SIMPLE.EMAIL;
      const userId = TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.SIMPLE.ID;

      const subscription = await db('Subscription')
        .where('id', subscriptionId)
        .first();

      const result = await UserServiceDomain.addServiceToUsers(
        subscription,
        [email],
        [GenericServiceCapabilityName.ACCESS]
      );

      expect(result).toHaveLength(1);
      const userService = result[0];

      expect(userService).toMatchObject({
        id: expect.any(String),
        user_id: userId,
        subscription_id: subscriptionId,
      });
    });

    it('should handle duplicate emails in the same call gracefully (second occurrence is skipped)', async () => {
      const email = TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.SIMPLE.EMAIL;
      const subscription = await db('Subscription')
        .where('id', subscriptionId)
        .first();

      // The same email appears twice in the array
      const result = await UserServiceDomain.addServiceToUsers(
        subscription,
        [email, email],
        [GenericServiceCapabilityName.ACCESS]
      );

      // First iteration creates the UserService; second iteration detects it
      // already exists and skips it.
      expect(result).toHaveLength(1);

      const allUserServices = await db<UserService>('User_Service')
        .where({ subscription_id: subscriptionId })
        .select('*');

      expect(allUserServices).toHaveLength(1);
    });
  });
});
