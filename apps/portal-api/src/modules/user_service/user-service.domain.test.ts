import { v4 as uuidv4 } from 'uuid';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '../../../knexfile';
import { SERVICES, TEST_ORGANIZATIONS } from '../../../tests/tests.const';
import { OrganizationId } from '../../model/kanel/public/Organization';
import { SubscriptionId } from '../../model/kanel/public/Subscription';
import User from '../../model/kanel/public/User';
import UserService, {
  UserServiceId,
} from '../../model/kanel/public/UserService';
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

const cleanupUserServices = async (subscriptionId: SubscriptionId) => {
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
};

const seedUserServiceForSimpleUser = async (subscriptionId: SubscriptionId) => {
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

  return { email, userId, subscription, result };
};

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
      const { userId, result } =
        await seedUserServiceForSimpleUser(subscriptionId);

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

      await UserServiceDomain.addServiceToUsers(
        subscription,
        [outsiderEmail],
        [GenericServiceCapabilityName.ACCESS]
      ).catch((err: Error) => {
        expect(err.message).toContain(
          'The email address does not correspond to the current organization'
        );
      });

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
      const { userId, result } =
        await seedUserServiceForSimpleUser(subscriptionId);

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

  describe('loadUserServiceByUser', () => {
    const createdSubscriptionIds: SubscriptionId[] = [];

    const simpleUser = {
      id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.SIMPLE.ID,
      selected_organization_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
    } as Parameters<typeof UserServiceDomain.loadUserServiceByUser>[0];

    // Pagination opts with a generous page size so all created records show up.
    const defaultOpts = {
      first: 50,
      orderBy: 'User_Service.id',
      orderMode: 'asc',
    };

    beforeEach(() => {
      vi.spyOn(mailService, 'sendMail').mockResolvedValue(undefined);
    });

    afterEach(async () => {
      vi.restoreAllMocks();

      // Remove all test-created UserService rows and their capabilities, then
      // the subscriptions themselves.
      for (const subId of createdSubscriptionIds) {
        await cleanupUserServices(subId);
        await db('Subscription').where('id', subId).delete();
      }
      // Reset for the next test
      createdSubscriptionIds.length = 0;
    });

    /**
     * Helper: creates an ACCEPTED subscription tied to SECOND_ORGANIZATION and
     * enrolls the SIMPLE user into it. Returns the subscription DB record.
     */
    async function createAcceptedSubscriptionWithUser(opts?: {
      start_date?: Date;
      end_date?: Date | null;
      status?: string;
      organization_id?: OrganizationId;
    }) {
      const subId = uuidv4() as SubscriptionId;
      createdSubscriptionIds.push(subId);

      await createSubscription({
        id: subId,
        service_instance_id: SERVICES.INSTANCES.VAULT.ID,
        organization_id:
          opts?.organization_id ?? TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        start_date: opts?.start_date ?? new Date(Date.now() - 86_400_000), // yesterday
        end_date:
          opts?.end_date !== undefined
            ? opts.end_date
            : new Date(Date.now() + 86_400_000 * 365), // 1 year from now
        billing: 0,
        status: opts?.status ?? SubscriptionStatus.ACCEPTED,
      });

      const subscription = await db('Subscription').where('id', subId).first();

      // Only enroll the user when the subscription is ACCEPTED (otherwise the
      // business logic in insertUserIntoOrganization may reject it).
      if (
        (opts?.status ?? SubscriptionStatus.ACCEPTED) ===
        SubscriptionStatus.ACCEPTED
      ) {
        // Insert the User_Service row directly to avoid coupling to
        // createUserServiceAccess (which requires the org domain to match and
        // also fires sendMail).  We want to test the *query*, not the creation.
        const userServiceId = uuidv4() as UserServiceId;
        await db('User_Service').insert({
          id: userServiceId,
          user_id: simpleUser.id,
          subscription_id: subId,
        });
      }

      return { subId, subscription };
    }

    it('should return a paginated connection with one edge for a user enrolled in a single active subscription', async () => {
      await createAcceptedSubscriptionWithUser();

      const result = await UserServiceDomain.loadUserServiceByUser(
        simpleUser,
        defaultOpts
      );

      expect(result.totalCount).toBe('1');
      expect(result.edges).toHaveLength(1);
      expect(result.edges[0]!.node!.user_id).toBe(simpleUser.id);
    });

    it('should return one edge per active subscription when the user is enrolled in multiple services', async () => {
      // Enrol the simple user in two separate subscriptions
      await createAcceptedSubscriptionWithUser();

      const subId2 = uuidv4() as SubscriptionId;
      createdSubscriptionIds.push(subId2);
      await createSubscription({
        id: subId2,
        service_instance_id: SERVICES.INSTANCES.MALWARE.ID,
        organization_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        start_date: new Date(Date.now() - 86_400_000),
        end_date: new Date(Date.now() + 86_400_000 * 365),
        billing: 0,
        status: SubscriptionStatus.ACCEPTED,
      });
      const userServiceId2 = uuidv4() as UserServiceId;
      await db('User_Service').insert({
        id: userServiceId2,
        user_id: simpleUser.id,
        subscription_id: subId2,
      });

      const result = await UserServiceDomain.loadUserServiceByUser(
        simpleUser,
        defaultOpts
      );

      expect(result.totalCount).toBe('2');
      expect(result.edges).toHaveLength(2);
      const userIds = result.edges.map((e) => e.node!.user_id);
      expect(userIds.every((id) => id === simpleUser.id)).toBe(true);
    });

    it('should return an empty connection for a user with no UserService rows in their selected org', async () => {
      // No subscriptions or UserService rows created for simpleUser in this test
      const result = await UserServiceDomain.loadUserServiceByUser(
        simpleUser,
        defaultOpts
      );

      expect(result.totalCount).toBe('0');
      expect(result.edges).toHaveLength(0);
    });

    it('should return an empty connection when the user ID does not exist in the database', async () => {
      const ghostUser = {
        id: uuidv4(),
        selected_organization_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
      } as Parameters<typeof UserServiceDomain.loadUserServiceByUser>[0];

      const result = await UserServiceDomain.loadUserServiceByUser(
        ghostUser,
        defaultOpts
      );

      expect(result.totalCount).toBe('0');
      expect(result.edges).toHaveLength(0);
    });

    it('should exclude subscriptions whose status is not ACCEPTED', async () => {
      // Create a subscription with a non-ACCEPTED status and manually insert a
      // User_Service row — the query filters on sub.status = 'ACCEPTED'.
      const subId = uuidv4() as SubscriptionId;
      createdSubscriptionIds.push(subId);
      await createSubscription({
        id: subId,
        service_instance_id: SERVICES.INSTANCES.VAULT.ID,
        organization_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        start_date: new Date(Date.now() - 86_400_000),
        end_date: new Date(Date.now() + 86_400_000 * 365),
        billing: 0,
        status: SubscriptionStatus.REQUESTED,
      });
      // Bypass the domain to force a UserService row pointing at the PENDING sub
      await db('User_Service').insert({
        id: uuidv4(),
        user_id: simpleUser.id,
        subscription_id: subId,
      });

      const result = await UserServiceDomain.loadUserServiceByUser(
        simpleUser,
        defaultOpts
      );

      expect(result.totalCount).toBe('0');
      expect(result.edges).toHaveLength(0);
    });

    it('should exclude subscriptions whose end_date is strictly in the past', async () => {
      const subId = uuidv4() as SubscriptionId;
      createdSubscriptionIds.push(subId);
      // end_date is set to yesterday — the subscription has expired
      await createSubscription({
        id: subId,
        service_instance_id: SERVICES.INSTANCES.VAULT.ID,
        organization_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        start_date: new Date(Date.now() - 86_400_000 * 30), // 30 days ago
        end_date: new Date(Date.now() - 86_400_000), // yesterday
        billing: 0,
        status: SubscriptionStatus.ACCEPTED,
      });
      await db('User_Service').insert({
        id: uuidv4(),
        user_id: simpleUser.id,
        subscription_id: subId,
      });

      const result = await UserServiceDomain.loadUserServiceByUser(
        simpleUser,
        defaultOpts
      );

      expect(result.totalCount).toBe('0');
      expect(result.edges).toHaveLength(0);
    });

    it('should include subscriptions that are active and have no end_date (ongoing)', async () => {
      const subId = uuidv4() as SubscriptionId;
      createdSubscriptionIds.push(subId);
      // end_date = undefined → stored as NULL, matching the orWhereNull branch
      await createSubscription({
        id: subId,
        service_instance_id: SERVICES.INSTANCES.VAULT.ID,
        organization_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        start_date: new Date(Date.now() - 86_400_000),
        end_date: undefined,
        billing: 0,
        status: SubscriptionStatus.ACCEPTED,
      });
      await db('User_Service').insert({
        id: uuidv4(),
        user_id: simpleUser.id,
        subscription_id: subId,
      });

      const result = await UserServiceDomain.loadUserServiceByUser(
        simpleUser,
        defaultOpts
      );

      expect(result.totalCount).toBe('1');
      expect(result.edges).toHaveLength(1);
    });

    it('should exclude subscriptions whose start_date is in the future', async () => {
      const subId = uuidv4() as SubscriptionId;
      createdSubscriptionIds.push(subId);
      // start_date is tomorrow — the subscription has not started yet
      await createSubscription({
        id: subId,
        service_instance_id: SERVICES.INSTANCES.VAULT.ID,
        organization_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        start_date: new Date(Date.now() + 86_400_000), // tomorrow
        end_date: new Date(Date.now() + 86_400_000 * 365),
        billing: 0,
        status: SubscriptionStatus.ACCEPTED,
      });
      await db('User_Service').insert({
        id: uuidv4(),
        user_id: simpleUser.id,
        subscription_id: subId,
      });

      const result = await UserServiceDomain.loadUserServiceByUser(
        simpleUser,
        defaultOpts
      );

      expect(result.totalCount).toBe('0');
      expect(result.edges).toHaveLength(0);
    });

    it('should exclude active subscriptions that belong to a different organization', async () => {
      // The FILIGRAN org subscription must not appear when the user has
      // selected_organization_id = SECOND_ORGANIZATION.ID
      const subId = uuidv4() as SubscriptionId;
      createdSubscriptionIds.push(subId);
      await createSubscription({
        id: subId,
        service_instance_id: SERVICES.INSTANCES.VAULT.ID,
        organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID, // different org
        start_date: new Date(Date.now() - 86_400_000),
        end_date: new Date(Date.now() + 86_400_000 * 365),
        billing: 0,
        status: SubscriptionStatus.ACCEPTED,
      });
      await db('User_Service').insert({
        id: uuidv4(),
        user_id: simpleUser.id,
        subscription_id: subId,
      });

      const result = await UserServiceDomain.loadUserServiceByUser(
        simpleUser,
        defaultOpts
      );

      expect(result.totalCount).toBe('0');
      expect(result.edges).toHaveLength(0);
    });

    it('should return correct pagination shape (edges, pageInfo, totalCount) for a single result', async () => {
      await createAcceptedSubscriptionWithUser();

      const result = await UserServiceDomain.loadUserServiceByUser(
        simpleUser,
        defaultOpts
      );

      // Top-level pagination fields
      expect(typeof result.totalCount).toBe('string');
      expect(Array.isArray(result.edges)).toBe(true);
      expect(result.pageInfo).toBeDefined();
      expect(typeof result.pageInfo.hasNextPage).toBe('boolean');
      expect(typeof result.pageInfo.hasPreviousPage).toBe('boolean');

      // Each edge must have a cursor and a node
      const edge = result.edges[0]!;
      expect(typeof edge.cursor).toBe('string');
      expect(edge.cursor.length).toBeGreaterThan(0);
      expect(edge.node).toBeDefined();
    });

    it('should include service_name and ordering columns on each edge node', async () => {
      // The query explicitly selects service.name as service_name and
      // service.ordering as ordering — verify they are present on the node.
      await createAcceptedSubscriptionWithUser();

      const result = await UserServiceDomain.loadUserServiceByUser(
        simpleUser,
        defaultOpts
      );

      expect(result.edges).toHaveLength(1);
      const node = result.edges[0]!.node as UserService & {
        service_name: string | null;
        ordering: number | null;
      };

      // service_name and ordering keys must exist on the returned node
      expect(Object.prototype.hasOwnProperty.call(node, 'service_name')).toBe(
        true
      );
      expect(Object.prototype.hasOwnProperty.call(node, 'ordering')).toBe(true);
    });

    it('should only return services belonging to the user identified by the provided user object', async () => {
      // Enrol the SIMPLE user
      await createAcceptedSubscriptionWithUser();

      // Also create a subscription for the ADMIN user (different user) in the
      // same org — it must NOT show up in the SIMPLE user's results.
      const adminSubId = uuidv4() as SubscriptionId;
      createdSubscriptionIds.push(adminSubId);
      await createSubscription({
        id: adminSubId,
        service_instance_id: SERVICES.INSTANCES.MALWARE.ID,
        organization_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        start_date: new Date(Date.now() - 86_400_000),
        end_date: new Date(Date.now() + 86_400_000 * 365),
        billing: 0,
        status: SubscriptionStatus.ACCEPTED,
      });
      await db('User_Service').insert({
        id: uuidv4(),
        user_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.ADMIN_ORGA.ID,
        subscription_id: adminSubId,
      });

      const result = await UserServiceDomain.loadUserServiceByUser(
        simpleUser,
        defaultOpts
      );

      // Only the SIMPLE user's service should be returned
      expect(result.totalCount).toBe('1');
      expect(result.edges).toHaveLength(1);
      expect(result.edges[0]!.node!.user_id).toBe(simpleUser.id);
    });
  });
});
