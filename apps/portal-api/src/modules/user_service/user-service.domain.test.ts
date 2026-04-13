import { v4 as uuidv4 } from 'uuid';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '../../../knexfile';
import {
  SERVICES,
  TEST_ORGANIZATIONS,
  requestContextAdminSecondOrga,
  // eslint-disable-next-line no-restricted-imports
  requestContextAdminUser,
} from '../../../tests/tests.const';
import { requestContext } from '../../context/request.context';
import { OrganizationId } from '../../model/kanel/public/Organization';
import { ServiceInstanceId } from '../../model/kanel/public/ServiceInstance';
import { SubscriptionId } from '../../model/kanel/public/Subscription';
import User, { UserId } from '../../model/kanel/public/User';
import UserService, {
  UserServiceId,
} from '../../model/kanel/public/UserService';
import UserServiceCapability from '../../model/kanel/public/UserServiceCapability';
import * as mailService from '../../server/mail-service';
import { loadUserBy } from '../organization-management/users/user-domain/users.domain';
import { removeUser } from '../organization-management/users/users.helper';
import {
  GenericServiceCapabilityIds,
  GenericServiceCapabilityName,
} from '../security-management/service-capability/generic_service_capability.const';
import { SubscriptionStatus } from '../subscription.const';
import { createSubscription } from '../subscription/subscription.domain';
import { UserServiceDomain } from './user_service.domain';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SIMPLE = TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.SIMPLE;
const ADMIN = TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.ADMIN_ORGA;
const SECOND_ORG_ID = TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID;

const DAY = 86_400_000;

// ---------------------------------------------------------------------------
// Shared DB helpers
// ---------------------------------------------------------------------------

const cleanupUserServices = async (subscriptionId: SubscriptionId) => {
  const userServices = await db<UserService[]>('User_Service')
    .where('subscription_id', subscriptionId)
    .select('*');

  if (userServices.length > 0) {
    await db<UserServiceCapability>('UserService_Capability')
      .whereIn(
        'user_service_id',
        userServices.map((us) => us.id)
      )
      .delete();
  }

  await db<UserService>('User_Service')
    .where('subscription_id', subscriptionId)
    .delete();
};

const makeSubscription = (overrides?: {
  id?: SubscriptionId;
  service_instance_id?: ServiceInstanceId;
  organization_id?: OrganizationId;
  start_date?: Date;
  end_date?: Date | null;
  status?: string;
}) => ({
  id: (overrides?.id ?? uuidv4()) as SubscriptionId,
  service_instance_id:
    overrides?.service_instance_id ?? SERVICES.INSTANCES.VAULT.ID,
  organization_id: overrides?.organization_id ?? SECOND_ORG_ID,
  start_date: overrides?.start_date ?? new Date(),
  end_date: overrides?.end_date !== undefined ? overrides.end_date : undefined,
  billing: 0,
  status: overrides?.status ?? SubscriptionStatus.ACCEPTED,
});

/** Creates a subscription and returns its id. */
const createTestSubscription = async (
  overrides?: Parameters<typeof makeSubscription>[0]
) => {
  const data = makeSubscription(overrides);
  await createSubscription(data);
  return data.id;
};

/** Inserts a bare User_Service row and returns its id. */
const insertUserService = async (
  userId: string,
  subId: SubscriptionId
): Promise<UserServiceId> => {
  const id = uuidv4() as UserServiceId;
  await db('User_Service').insert({
    id,
    user_id: userId,
    subscription_id: subId,
  });
  return id;
};

/** Inserts a User_Service row plus one ACCESS capability row. */
const insertUserServiceWithCapability = async (
  userId: string,
  subId: SubscriptionId
): Promise<{ userServiceId: UserServiceId; capabilityId: string }> => {
  const userServiceId = await insertUserService(userId, subId);
  const capabilityId = uuidv4();
  await db('UserService_Capability').insert({
    id: capabilityId,
    user_service_id: userServiceId,
    generic_service_capability_id: GenericServiceCapabilityIds.AccessId,
  });
  return { userServiceId, capabilityId };
};

// ---------------------------------------------------------------------------
// Shared lifecycle helpers for describe blocks that own one subscription
// ---------------------------------------------------------------------------

/**
 * Creates a fresh ACCEPTED subscription before each test and tears it down
 * (plus all its User_Service rows) after each test.
 * Returns a ref object so the `subscriptionId` is always current.
 */
const useSubscription = () => {
  const ref = { id: '' as SubscriptionId };

  beforeEach(async () => {
    ref.id = await createTestSubscription({
      start_date: new Date(),
      end_date: undefined,
    });
  });

  afterEach(async () => {
    await cleanupUserServices(ref.id);
    await db('Subscription').where('id', ref.id).delete();
  });

  return ref;
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('UserServiceDomain', () => {
  describe('addServiceToUsers', () => {
    const sub = useSubscription();

    beforeEach(() => {
      vi.spyOn(mailService, 'sendMail').mockResolvedValue(undefined);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    const getSubscription = () =>
      db('Subscription').where('id', sub.id).first();

    const addSimpleUser = async (
      capabilities = [GenericServiceCapabilityName.ACCESS]
    ) => {
      const subscription = await getSubscription();
      return UserServiceDomain.addServiceToUsers(
        subscription,
        [SIMPLE.EMAIL],
        capabilities
      );
    };

    it('should create a UserService for an existing org user', async () => {
      const result = await addSimpleUser();

      expect(result).toHaveLength(1);
      expect(result[0]!.subscription_id).toBe(sub.id);
      expect(result[0]!.user_id).toBe(SIMPLE.ID);

      const persisted = await db<UserService>('User_Service')
        .where({ id: result[0]!.id })
        .first();
      expect(persisted).toBeDefined();
      expect(persisted!.subscription_id).toBe(sub.id);
    });

    it('should add the ACCESS capability even when capabilities array is empty', async () => {
      const subscription = await getSubscription();
      const result = await UserServiceDomain.addServiceToUsers(
        subscription,
        [SIMPLE.EMAIL],
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

    it('should create UserService records for multiple users in one call', async () => {
      const subscription = await getSubscription();
      const result = await UserServiceDomain.addServiceToUsers(
        subscription,
        [SIMPLE.EMAIL, ADMIN.EMAIL],
        [GenericServiceCapabilityName.ACCESS]
      );

      expect(result).toHaveLength(2);

      const persisted = await db<UserService[]>('User_Service')
        .whereIn(
          'id',
          result.map((us) => us.id)
        )
        .select('*');

      expect(persisted).toHaveLength(2);
      expect(persisted.every((us) => us.subscription_id === sub.id)).toBe(true);
    });

    it('should return an empty array and create no DB records when emails list is empty', async () => {
      const subscription = await getSubscription();
      const result = await UserServiceDomain.addServiceToUsers(
        subscription,
        [],
        [GenericServiceCapabilityName.ACCESS]
      );

      expect(result).toEqual([]);

      const rows = await db<UserService>('User_Service')
        .where('subscription_id', sub.id)
        .select('*');
      expect(rows).toHaveLength(0);
    });

    it('should skip users that already have a UserService for the subscription', async () => {
      await addSimpleUser();
      const secondResult = await addSimpleUser();

      expect(secondResult).toHaveLength(0);

      const rows = await db<UserService>('User_Service')
        .where({ subscription_id: sub.id })
        .select('*');
      expect(rows).toHaveLength(1);
    });

    it('should only return newly created records when some users already have access', async () => {
      const subscription = await getSubscription();
      await UserServiceDomain.addServiceToUsers(
        subscription,
        [SIMPLE.EMAIL],
        [GenericServiceCapabilityName.ACCESS]
      );

      const result = await UserServiceDomain.addServiceToUsers(
        subscription,
        [SIMPLE.EMAIL, ADMIN.EMAIL],
        [GenericServiceCapabilityName.ACCESS]
      );

      expect(result).toHaveLength(1);
      const user2 = await loadUserBy({ email: ADMIN.EMAIL });
      expect(result[0]!.user_id).toBe(user2.id);
    });

    it('should create a new User record for an unknown email in the org domain', async () => {
      requestContext.set(requestContextAdminSecondOrga);

      const newEmail = `new-user-${uuidv4()}@${TEST_ORGANIZATIONS.SECOND_ORGANIZATION.DOMAINS.FIRST.NAME}`;
      const subscription = await getSubscription();

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

      await cleanupUserServices(sub.id);
      await removeUser({ email: newEmail });
    });

    it('should reuse an existing user when the email is already in the DB', async () => {
      const result = await addSimpleUser();

      expect(result).toHaveLength(1);
      expect(result[0]!.user_id).toBe(SIMPLE.ID);

      const usersWithEmail = await db<User>('User')
        .where('email', SIMPLE.EMAIL)
        .select('id');
      expect(usersWithEmail).toHaveLength(1);
    });

    it('should persist UserService_Capability rows including ACCESS', async () => {
      const result = await addSimpleUser();

      const capabilities = await db<UserServiceCapability[]>(
        'UserService_Capability'
      )
        .where('user_service_id', result[0]!.id)
        .select('*');

      expect(capabilities.length).toBeGreaterThan(0);
      expect(
        capabilities.some(
          (c) =>
            c.generic_service_capability_id ===
            GenericServiceCapabilityIds.AccessId
        )
      ).toBe(true);
    });

    it('should persist MANAGE_ACCESS capability when requested', async () => {
      const result = await addSimpleUser([
        GenericServiceCapabilityName.MANAGE_ACCESS,
      ]);

      const capabilities = await db<UserServiceCapability[]>(
        'UserService_Capability'
      )
        .where('user_service_id', result[0]!.id)
        .select('*');

      expect(
        capabilities.some(
          (c) =>
            c.generic_service_capability_id ===
            GenericServiceCapabilityIds.ManageAccessId
        )
      ).toBe(true);
    });

    it('should throw a GraphQL error when an email domain does not match the org', async () => {
      const outsiderEmail = `outsider-${uuidv4()}@filigran.io`;
      const subscription = await getSubscription();

      const call = UserServiceDomain.addServiceToUsers(
        subscription,
        [outsiderEmail],
        [GenericServiceCapabilityName.ACCESS]
      );
      await expect(call).rejects.toThrow(
        'The email address does not correspond to the current organization'
      );

      const rows = await db<UserService>('User_Service')
        .where('subscription_id', sub.id)
        .select('*');
      expect(rows).toHaveLength(0);
    });

    it('should call sendMail once per newly created UserService', async () => {
      const subscription = await getSubscription();
      await UserServiceDomain.addServiceToUsers(
        subscription,
        [SIMPLE.EMAIL, ADMIN.EMAIL],
        [GenericServiceCapabilityName.ACCESS]
      );

      expect(mailService.sendMail).toHaveBeenCalledTimes(2);
    });

    it('should not call sendMail when the user already has access', async () => {
      await addSimpleUser();

      vi.clearAllMocks();
      vi.spyOn(mailService, 'sendMail').mockResolvedValue(undefined);

      await addSimpleUser();

      expect(mailService.sendMail).not.toHaveBeenCalled();
    });

    it('should return UserService objects with the correct shape', async () => {
      const result = await addSimpleUser();

      expect(result[0]).toMatchObject({
        id: expect.any(String),
        user_id: SIMPLE.ID,
        subscription_id: sub.id,
      });
    });

    it('should handle duplicate emails in the same call gracefully', async () => {
      const subscription = await getSubscription();
      const result = await UserServiceDomain.addServiceToUsers(
        subscription,
        [SIMPLE.EMAIL, SIMPLE.EMAIL],
        [GenericServiceCapabilityName.ACCESS]
      );

      expect(result).toHaveLength(1);

      const rows = await db<UserService>('User_Service')
        .where({ subscription_id: sub.id })
        .select('*');
      expect(rows).toHaveLength(1);
    });
  });

  describe('loadUserServiceByUser', () => {
    const createdSubscriptionIds: SubscriptionId[] = [];

    const simpleUser = {
      id: SIMPLE.ID,
      selected_organization_id: SECOND_ORG_ID,
    } as Parameters<typeof UserServiceDomain.loadUserServiceByUser>[0];

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
      for (const subId of createdSubscriptionIds) {
        await cleanupUserServices(subId);
        await db('Subscription').where('id', subId).delete();
      }
      createdSubscriptionIds.length = 0;
    });

    /** Creates an ACCEPTED subscription and enrols simpleUser into it. */
    const createSubscriptionWithUser = async (overrides?: {
      start_date?: Date;
      end_date?: Date | null;
      status?: string;
      organization_id?: OrganizationId;
      service_instance_id?: ServiceInstanceId;
    }) => {
      const subId = uuidv4() as SubscriptionId;
      createdSubscriptionIds.push(subId);

      await createSubscription({
        id: subId,
        service_instance_id:
          overrides?.service_instance_id ?? SERVICES.INSTANCES.VAULT.ID,
        organization_id: overrides?.organization_id ?? SECOND_ORG_ID,
        start_date: overrides?.start_date ?? new Date(Date.now() - DAY),
        end_date:
          overrides?.end_date !== undefined
            ? overrides.end_date
            : new Date(Date.now() + DAY * 365),
        billing: 0,
        status: overrides?.status ?? SubscriptionStatus.ACCEPTED,
      });

      const subscription = await db('Subscription').where('id', subId).first();

      if (
        (overrides?.status ?? SubscriptionStatus.ACCEPTED) ===
        SubscriptionStatus.ACCEPTED
      ) {
        await insertUserService(simpleUser.id, subId);
      }

      return { subId, subscription };
    };

    it('should return one edge for a user enrolled in a single active subscription', async () => {
      await createSubscriptionWithUser();

      const result = await UserServiceDomain.loadUserServiceByUser(
        simpleUser,
        defaultOpts
      );

      expect(result.totalCount).toBe('1');
      expect(result.edges).toHaveLength(1);
      expect(result.edges[0]!.node!.user_id).toBe(simpleUser.id);
    });

    it('should return one edge per active subscription when enrolled in multiple services', async () => {
      await createSubscriptionWithUser();

      const subId2 = uuidv4() as SubscriptionId;
      createdSubscriptionIds.push(subId2);
      await createSubscription({
        id: subId2,
        service_instance_id: SERVICES.INSTANCES.OPENAEV_SCENARIOS.ID,
        organization_id: SECOND_ORG_ID,
        start_date: new Date(Date.now() - DAY),
        end_date: new Date(Date.now() + DAY * 365),
        billing: 0,
        status: SubscriptionStatus.ACCEPTED,
      });
      await insertUserService(simpleUser.id, subId2);

      const result = await UserServiceDomain.loadUserServiceByUser(
        simpleUser,
        defaultOpts
      );

      expect(result.totalCount).toBe('2');
      expect(result.edges).toHaveLength(2);
      expect(result.edges.every((e) => e.node!.user_id === simpleUser.id)).toBe(
        true
      );
    });

    it('should return an empty connection when the user has no UserService rows', async () => {
      const result = await UserServiceDomain.loadUserServiceByUser(
        simpleUser,
        defaultOpts
      );

      expect(result.totalCount).toBe('0');
      expect(result.edges).toHaveLength(0);
    });

    it('should return an empty connection for a non-existent user id', async () => {
      const ghostUser = {
        id: uuidv4(),
        selected_organization_id: SECOND_ORG_ID,
      } as Parameters<typeof UserServiceDomain.loadUserServiceByUser>[0];

      const result = await UserServiceDomain.loadUserServiceByUser(
        ghostUser,
        defaultOpts
      );

      expect(result.totalCount).toBe('0');
      expect(result.edges).toHaveLength(0);
    });

    it('should exclude subscriptions whose status is not ACCEPTED', async () => {
      const subId = uuidv4() as SubscriptionId;
      createdSubscriptionIds.push(subId);
      await createSubscription({
        id: subId,
        service_instance_id: SERVICES.INSTANCES.VAULT.ID,
        organization_id: SECOND_ORG_ID,
        start_date: new Date(Date.now() - DAY),
        end_date: new Date(Date.now() + DAY * 365),
        billing: 0,
        status: SubscriptionStatus.REQUESTED,
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

    it('should exclude subscriptions whose end_date is in the past', async () => {
      const subId = uuidv4() as SubscriptionId;
      createdSubscriptionIds.push(subId);
      await createSubscription({
        id: subId,
        service_instance_id: SERVICES.INSTANCES.VAULT.ID,
        organization_id: SECOND_ORG_ID,
        start_date: new Date(Date.now() - DAY * 30),
        end_date: new Date(Date.now() - DAY),
        billing: 0,
        status: SubscriptionStatus.ACCEPTED,
      });
      await insertUserService(simpleUser.id, subId);

      const result = await UserServiceDomain.loadUserServiceByUser(
        simpleUser,
        defaultOpts
      );

      expect(result.totalCount).toBe('0');
      expect(result.edges).toHaveLength(0);
    });

    it('should include active subscriptions with no end_date (ongoing)', async () => {
      await createSubscriptionWithUser({ end_date: null });

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
      await createSubscription({
        id: subId,
        service_instance_id: SERVICES.INSTANCES.VAULT.ID,
        organization_id: SECOND_ORG_ID,
        start_date: new Date(Date.now() + DAY),
        end_date: new Date(Date.now() + DAY * 365),
        billing: 0,
        status: SubscriptionStatus.ACCEPTED,
      });
      await insertUserService(simpleUser.id, subId);

      const result = await UserServiceDomain.loadUserServiceByUser(
        simpleUser,
        defaultOpts
      );

      expect(result.totalCount).toBe('0');
      expect(result.edges).toHaveLength(0);
    });

    it('should exclude subscriptions belonging to a different organization', async () => {
      const subId = uuidv4() as SubscriptionId;
      createdSubscriptionIds.push(subId);
      await createSubscription({
        id: subId,
        service_instance_id: SERVICES.INSTANCES.VAULT.ID,
        organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
        start_date: new Date(Date.now() - DAY),
        end_date: new Date(Date.now() + DAY * 365),
        billing: 0,
        status: SubscriptionStatus.ACCEPTED,
      });
      await insertUserService(simpleUser.id, subId);

      const result = await UserServiceDomain.loadUserServiceByUser(
        simpleUser,
        defaultOpts
      );

      expect(result.totalCount).toBe('0');
      expect(result.edges).toHaveLength(0);
    });

    it('should return correct pagination shape (edges, pageInfo, totalCount)', async () => {
      await createSubscriptionWithUser();

      const result = await UserServiceDomain.loadUserServiceByUser(
        simpleUser,
        defaultOpts
      );

      expect(typeof result.totalCount).toBe('string');
      expect(Array.isArray(result.edges)).toBe(true);
      expect(result.pageInfo).toBeDefined();
      expect(typeof result.pageInfo.hasNextPage).toBe('boolean');
      expect(typeof result.pageInfo.hasPreviousPage).toBe('boolean');

      const edge = result.edges[0]!;
      expect(typeof edge.cursor).toBe('string');
      expect(edge.cursor.length).toBeGreaterThan(0);
      expect(edge.node).toBeDefined();
    });

    it('should include service_name and ordering columns on each edge node', async () => {
      await createSubscriptionWithUser();

      const result = await UserServiceDomain.loadUserServiceByUser(
        simpleUser,
        defaultOpts
      );

      const node = result.edges[0]!.node as UserService & {
        service_name: string | null;
        ordering: number | null;
      };

      expect(Object.prototype.hasOwnProperty.call(node, 'service_name')).toBe(
        true
      );
      expect(Object.prototype.hasOwnProperty.call(node, 'ordering')).toBe(true);
    });

    it('should only return services belonging to the queried user', async () => {
      await createSubscriptionWithUser();

      const adminSubId = uuidv4() as SubscriptionId;
      createdSubscriptionIds.push(adminSubId);
      await createSubscription({
        id: adminSubId,
        service_instance_id: SERVICES.INSTANCES.OPENAEV_SCENARIOS.ID,
        organization_id: SECOND_ORG_ID,
        start_date: new Date(Date.now() - DAY),
        end_date: new Date(Date.now() + DAY * 365),
        billing: 0,
        status: SubscriptionStatus.ACCEPTED,
      });
      await insertUserService(ADMIN.ID, adminSubId);

      const result = await UserServiceDomain.loadUserServiceByUser(
        simpleUser,
        defaultOpts
      );

      expect(result.totalCount).toBe('1');
      expect(result.edges).toHaveLength(1);
      expect(result.edges[0]!.node!.user_id).toBe(simpleUser.id);
    });
  });

  describe('deleteUserService', () => {
    const sub = useSubscription();

    it('should delete the matching User_Service row and return it', async () => {
      const userServiceId = await insertUserService(SIMPLE.ID, sub.id);

      const result = await UserServiceDomain.deleteUserService(
        SIMPLE.ID,
        sub.id
      );

      expect(result).toBeDefined();
      expect(result).toMatchObject({
        id: userServiceId,
        user_id: SIMPLE.ID,
        subscription_id: sub.id,
      });

      const remaining = await db<UserService>('User_Service')
        .where('id', userServiceId)
        .first();
      expect(remaining).toBeUndefined();
    });

    it('should cascade-delete all UserService_Capability rows when the parent is deleted', async () => {
      const { userServiceId, capabilityId } =
        await insertUserServiceWithCapability(SIMPLE.ID, sub.id);

      const before = await db<UserServiceCapability>('UserService_Capability')
        .where('id', capabilityId)
        .first();
      expect(before).toBeDefined();

      await UserServiceDomain.deleteUserService(SIMPLE.ID, sub.id);

      const deletedService = await db<UserService>('User_Service')
        .where('id', userServiceId)
        .first();
      expect(deletedService).toBeUndefined();

      const deletedCapability = await db<UserServiceCapability>(
        'UserService_Capability'
      )
        .where('id', capabilityId)
        .first();
      expect(deletedCapability).toBeUndefined();
    });

    it('should cascade-delete multiple UserService_Capability rows for the same User_Service', async () => {
      const userServiceId = await insertUserService(SIMPLE.ID, sub.id);

      const cap1Id = uuidv4();
      const cap2Id = uuidv4();
      await db('UserService_Capability').insert([
        {
          id: cap1Id,
          user_service_id: userServiceId,
          generic_service_capability_id: GenericServiceCapabilityIds.AccessId,
        },
        {
          id: cap2Id,
          user_service_id: userServiceId,
          generic_service_capability_id:
            GenericServiceCapabilityIds.ManageAccessId,
        },
      ]);

      await UserServiceDomain.deleteUserService(SIMPLE.ID, sub.id);

      const survivors = await db<UserServiceCapability>(
        'UserService_Capability'
      )
        .whereIn('id', [cap1Id, cap2Id])
        .select('id');
      expect(survivors).toHaveLength(0);
    });

    it('should return undefined when userId does not match any row', async () => {
      await insertUserService(SIMPLE.ID, sub.id);
      const ghostId = uuidv4() as UserId;

      const result = await UserServiceDomain.deleteUserService(ghostId, sub.id);

      expect(result).toBeUndefined();

      const remaining = await db<UserService>('User_Service')
        .where('subscription_id', sub.id)
        .select('id');
      expect(remaining).toHaveLength(1);
    });

    it('should return undefined when subscriptionId does not match any row', async () => {
      await insertUserService(SIMPLE.ID, sub.id);
      const ghostSubId = uuidv4() as SubscriptionId;

      const result = await UserServiceDomain.deleteUserService(
        SIMPLE.ID,
        ghostSubId
      );

      expect(result).toBeUndefined();

      const remaining = await db<UserService>('User_Service')
        .where({ user_id: SIMPLE.ID, subscription_id: sub.id })
        .first();
      expect(remaining).toBeDefined();
    });

    it('should return undefined and delete nothing when both ids are non-existent', async () => {
      const ghostId = uuidv4() as UserId;
      const ghostSubId = uuidv4() as SubscriptionId;

      const result = await UserServiceDomain.deleteUserService(
        ghostId,
        ghostSubId
      );

      expect(result).toBeUndefined();
    });

    it('should only delete the targeted row when multiple users share the same subscription', async () => {
      await insertUserService(SIMPLE.ID, sub.id);
      const adminServiceId = await insertUserService(ADMIN.ID, sub.id);

      await UserServiceDomain.deleteUserService(SIMPLE.ID, sub.id);

      const adminService = await db<UserService>('User_Service')
        .where('id', adminServiceId)
        .first();
      expect(adminService).toBeDefined();
      expect(adminService!.user_id).toBe(ADMIN.ID);

      const remaining = await db<UserService>('User_Service')
        .where('subscription_id', sub.id)
        .select('id');
      expect(remaining).toHaveLength(1);
    });

    it('should not delete rows belonging to a different subscription for the same user', async () => {
      const secondSubId = await createTestSubscription({
        service_instance_id: SERVICES.INSTANCES.OPENAEV_SCENARIOS.ID,
        start_date: new Date(),
        end_date: undefined,
      });

      await insertUserService(SIMPLE.ID, sub.id);
      const secondServiceId = await insertUserService(SIMPLE.ID, secondSubId);

      await UserServiceDomain.deleteUserService(SIMPLE.ID, sub.id);

      const secondService = await db<UserService>('User_Service')
        .where('id', secondServiceId)
        .first();
      expect(secondService).toBeDefined();
      expect(secondService!.subscription_id).toBe(secondSubId);

      await cleanupUserServices(secondSubId);
      await db('Subscription').where('id', secondSubId).delete();
    });

    it('should be idempotent — second call returns undefined without throwing', async () => {
      await insertUserService(SIMPLE.ID, sub.id);

      const first = await UserServiceDomain.deleteUserService(
        SIMPLE.ID,
        sub.id
      );
      expect(first).toBeDefined();

      const second = await UserServiceDomain.deleteUserService(
        SIMPLE.ID,
        sub.id
      );
      expect(second).toBeUndefined();
    });

    it('should return an object matching the UserService shape', async () => {
      const userServiceId = await insertUserService(SIMPLE.ID, sub.id);

      const result = await UserServiceDomain.deleteUserService(
        SIMPLE.ID,
        sub.id
      );

      expect(result).toMatchObject({
        id: userServiceId,
        user_id: SIMPLE.ID,
        subscription_id: sub.id,
      });
      expect(
        Object.prototype.hasOwnProperty.call(result, 'service_personal_data')
      ).toBe(true);
    });
  });

  describe('loadUserServiceBySubscription', () => {
    const defaultOpts = {
      first: 50,
      orderBy: 'User_Service.id',
      orderMode: 'asc',
    };

    const secondOrgaSub = useSubscription();
    let filigranSubId: SubscriptionId;

    beforeEach(async () => {
      filigranSubId = await createTestSubscription({
        organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
        service_instance_id: SERVICES.INSTANCES.VAULT.ID,
        start_date: new Date(),
        end_date: undefined,
      });
      await insertUserService(SIMPLE.ID, secondOrgaSub.id);
      await insertUserService(
        TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
        filigranSubId
      );
    });

    afterEach(async () => {
      await cleanupUserServices(filigranSubId);
      await db('Subscription').where('id', filigranSubId).delete();
    });

    it('should return only users from the selected organization', async () => {
      requestContext.set(requestContextAdminSecondOrga);

      const result = await UserServiceDomain.loadUserServiceBySubscription(
        defaultOpts,
        secondOrgaSub.id
      );

      const returnedUserIds = result.edges.map((e) => e.node!.user_id);
      expect(returnedUserIds).toContain(SIMPLE.ID);
      expect(returnedUserIds).not.toContain(
        TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID
      );
    });

    it('should not return users from the selected organization subscription when querying from another organization', async () => {
      requestContext.set(requestContextAdminSecondOrga);

      const result = await UserServiceDomain.loadUserServiceBySubscription(
        defaultOpts,
        filigranSubId
      );

      expect(result.edges).toHaveLength(0);
    });

    it('should return users from any organization for filigran admin', async () => {
      requestContext.set({
        ...requestContextAdminUser,
        user: {
          ...requestContextAdminUser.user,
          selected_organization_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        },
      });

      const result = await UserServiceDomain.loadUserServiceBySubscription(
        defaultOpts,
        filigranSubId
      );

      const returnedUserIds = result.edges.map((e) => e.node!.user_id);
      expect(returnedUserIds).toContain(
        TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID
      );
    });
  });
});
