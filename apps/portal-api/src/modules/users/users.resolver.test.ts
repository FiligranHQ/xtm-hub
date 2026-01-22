import { MockInstance } from '@vitest/spy';
import { GraphQLResolveInfo } from 'graphql';
import { toGlobalId } from 'graphql-relay/node/node.js';
import { v4 as uuidv4 } from 'uuid';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { SubscriptionSpy } from '../../../tests/test-utils';
import {
  contextAdminOrgaThales,
  contextAdminUser,
  DEFAULT_ADMIN_EMAIL,
  DEFAULT_ADMIN_PASSWORD,
  requestContextAdminUser,
  requestContextThalesUser,
  SERVICE_VAULT_ID,
  SIMPLE_USER_FILIGRAN_ID,
  THALES_ADMIN_ORGA_EMAIL,
  THALES_ADMIN_ORGA_USER_ID,
  THALES_ORGA_ID,
} from '../../../tests/tests.const';
import {
  AddUserInput,
  AdminEditUserInput,
  OrderingMode,
  Organization,
  OrganizationCapability,
  UserOrdering,
} from '../../__generated__/resolvers-types';
import { loginFromProvider } from '../../auth/auth-user';
import { requestContext } from '../../context/request.context';
import { SubscriptionId } from '../../model/kanel/public/Subscription';
import { UserId } from '../../model/kanel/public/User';
import { UserLoadUserBy } from '../../model/user';
import { PLATFORM_ORGANIZATION_UUID } from '../../portal.const';
import { auth0ClientMock } from '../../thirdparty/auth0/mock';
import * as UserOrganizationDomain from '../common/user-organization.domain';
import {
  deleteSubscription,
  insertSubscription,
} from '../subcription/subscription.helper';
import { UserOrganizationPendingDomain } from './users-pending/user-organization-pending.domain';
import { deleteUserById, loadUser, loadUserBy } from './users.domain';
import { removeUser } from './users.helper';
import usersResolver from './users.resolver';

const SUBSCRIPTION_ID = '7c6e887e-9553-439b-aeaf-a81911c399d2';
const RANDOM_ORGA_ID = '681fb117-e2c3-46d3-945a-0e921b5d4b6d';

describe('User query resolver', () => {
  describe('userHasOrganizationWithSubscription', () => {
    beforeEach(async () => {
      await insertSubscription({
        id: SUBSCRIPTION_ID,
        organization_id: THALES_ORGA_ID,
        service_instance_id: SERVICE_VAULT_ID,
      });
    });
    it.each`
      expected | organizations                                                                               | description
      ${true}  | ${[{ id: THALES_ORGA_ID, name: 'Thales', personal_space: false, domains: ['thales.com'] }]} | ${'organization has subscription'}
      ${false} | ${[]}                                                                                       | ${'has no organization'}
      ${false} | ${[{ id: RANDOM_ORGA_ID, name: 'Other', personal_space: false, domains: ['thales.com'] }]}  | ${'no organization has subscription'}
    `(
      'Should return $expected if $description',
      async ({ expected, organizations }) => {
        const currentContext = {
          ...contextAdminOrgaThales,
          user: {
            ...contextAdminOrgaThales.user,
            organizations: organizations,
          },
        };
        requestContext.set({
          user: currentContext.user,
          portalContext: currentContext,
        });

        const response =
          // @ts-ignore
          await usersResolver.Query.userHasOrganizationWithSubscription(
            undefined,
            {},
            currentContext
          );

        expect(response).toStrictEqual(expected);
      }
    );
    afterEach(async () => {
      await deleteSubscription({
        id: SUBSCRIPTION_ID as SubscriptionId,
      });
    });
  });

  describe('listPendingUser', () => {
    it('should list pending users from any organization for bypass', async () => {
      const testContext = {
        ...contextAdminUser,
        user: {
          ...contextAdminUser.user,
          selected_organization_id: THALES_ORGA_ID,
        },
      };
      requestContext.set({
        user: testContext.user,
        portalContext: testContext,
      });
      const email = `testPending${uuidv4()}@thales.com`;
      const pendingUser = await loginFromProvider({
        email: email,
        first_name: 'test',
        last_name: 'pending',
        roles: [],
      });

      const options = {
        first: 50,
        orderMode: OrderingMode.Asc,
        orderBy: UserOrdering.FirstName,
        filters: [],
      };

      const response = await usersResolver.Query.pendingUsers(
        undefined,
        options,
        testContext,
        undefined
      );
      expect(response.totalCount).toBe('1');
      expect(response.edges[0].node.id).toBe(pendingUser.id);

      requestContext.set(requestContextAdminUser);
      await removeUser({ email: pendingUser.email });
    });
    it('should list pending users from the orga if orga filter exists', async () => {
      const testContext = {
        ...contextAdminOrgaThales,
        user: {
          ...contextAdminOrgaThales.user,
          selected_organization_id: THALES_ORGA_ID,
        },
      };
      const pendingUserThales = await loginFromProvider({
        email: `testPending${uuidv4()}@thales.com`,
        first_name: 'thales',
        last_name: 'pending',
        roles: [],
      });
      const pendingUserFiligran = await loginFromProvider({
        email: `testPending${uuidv4()}@filigran.io`,
        first_name: 'filigran',
        last_name: 'pending',
        roles: [],
      });

      const options = {
        first: 50,
        orderMode: OrderingMode.Asc,
        orderBy: UserOrdering.FirstName,
        filters: [
          {
            key: 'organization_id',
            value: [toGlobalId('Organization', THALES_ORGA_ID)],
          },
        ],
      };
      requestContext.set({
        user: testContext.user,
        portalContext: testContext,
      });
      const response = await usersResolver.Query.pendingUsers(
        undefined,
        options,
        testContext,
        undefined
      );

      expect(response.totalCount).toBe('1');
      expect(response.edges[0].node.id).toBe(pendingUserThales.id);

      requestContext.set(requestContextAdminUser);
      await removeUser({ email: pendingUserThales.email });
      await removeUser({ email: pendingUserFiligran.email });
    });
    it('should list pending users in the user orga even if no filter is specified', async () => {
      const testContext = {
        ...contextAdminOrgaThales,
        user: {
          ...contextAdminOrgaThales.user,
          selected_organization_id: THALES_ORGA_ID,
        },
      };
      const pendingUserThales = await loginFromProvider({
        email: `testPending${uuidv4()}@thales.com`,
        first_name: 'thales',
        last_name: 'pending',
        roles: [],
      });
      const pendingUserFiligran = await loginFromProvider({
        email: `testPending${uuidv4()}@filigran.io`,
        first_name: 'filigran',
        last_name: 'pending',
        roles: [],
      });

      const options = {
        first: 50,
        orderMode: OrderingMode.Asc,
        orderBy: UserOrdering.FirstName,
        filters: [],
      };

      requestContext.set({
        user: testContext.user,
        portalContext: testContext,
      });
      const response = await usersResolver.Query.pendingUsers(
        undefined,
        options,
        testContext,
        undefined
      );

      expect(response.totalCount).toBe('1');
      expect(response.edges[0].node.id).toBe(pendingUserThales.id);

      requestContext.set(requestContextAdminUser);
      await removeUser({ email: pendingUserThales.email });
      await removeUser({ email: pendingUserFiligran.email });
    });
  });
});

describe('User mutation resolver', () => {
  it('should be login', async () => {
    // @ts-ignore
    const response = await usersResolver.Mutation.login(
      undefined,
      { email: DEFAULT_ADMIN_EMAIL, password: DEFAULT_ADMIN_PASSWORD },
      {
        req: {
          session: {
            user: {},
          },
        },
      }
    );
    expect(response).toBeTruthy();
  });

  describe('adminAddUser', () => {
    afterEach(async () => {
      vi.restoreAllMocks();
    });
    it('should not create an existing user', async () => {
      try {
        // @ts-ignore
        await usersResolver.Mutation.adminAddUser(
          undefined,
          {
            input: {
              email: DEFAULT_ADMIN_EMAIL,
              password: DEFAULT_ADMIN_PASSWORD,
            } as AddUserInput,
          },
          contextAdminUser
        );
      } catch (error) {
        // Should throw an error and catch it.
        // As we do not use a running server we need to catch the error
        // otherwise it would be send in the graphql response as an error.
        expect(error).toBeTruthy();
      }
    });
    it('should not partially create a user if an error occurs', async () => {
      const testEmail = 'testRollback@company.com';
      try {
        vi.spyOn(
          UserOrganizationDomain,
          'updateMultipleUserOrgWithCapabilities'
        ).mockImplementation(() => {
          throw new Error('Test error');
        });
        const testEmail = 'testRollback@company.com';
        // @ts-ignore
        await usersResolver.Mutation.adminAddUser(
          undefined,
          {
            input: {
              email: testEmail,
              password: 'fake password',
            } as AddUserInput,
          },
          contextAdminUser
        );
      } catch (error) {
        // Should throw an error and catch it.
        // As we do not use a running server we need to catch the error
        // otherwise it would be send in the graphql response as an error.
        expect(error).toBeTruthy();
      }
      const user = await loadUserBy({ 'User.email': testEmail });
      expect(user).toBeUndefined();
    });

    it('should should send a add event in sse', async () => {
      const filigranSpy = new SubscriptionSpy();
      const thalesSpy = new SubscriptionSpy();
      // @ts-ignore
      await filigranSpy.spy(
        usersResolver.Subscription.User,
        {
          organizationId: toGlobalId(
            'Organization',
            PLATFORM_ORGANIZATION_UUID
          ),
        },
        contextAdminUser,
        ['add']
      );

      await thalesSpy.spy(
        usersResolver.Subscription.User,
        {
          organizationId: toGlobalId('Organization', THALES_ORGA_ID),
        },
        contextAdminOrgaThales,
        ['add']
      );

      const email = 'sseEventAddUser@filigran.io';
      // @ts-ignore
      await usersResolver.Mutation.adminAddUser(
        undefined,
        {
          input: {
            email: email,
            password: DEFAULT_ADMIN_PASSWORD,
            organization_capabilities: [
              {
                organization_id: toGlobalId(
                  'Organization',
                  PLATFORM_ORGANIZATION_UUID
                ),
                capabilities: [],
              },
            ],
          } as AddUserInput,
        },
        contextAdminUser
      );

      const events = await filigranSpy.waitForEvents(1);

      expect(events).toHaveLength(1);
      expect(events[0].User.add.email).toBe(email);
      await thalesSpy.expectNoEvents();

      await filigranSpy.cleanup();
      await thalesSpy.cleanup();
    });

    describe('create user with personal space', async () => {
      let user: UserLoadUserBy;
      let organizations: Organization[];
      beforeAll(async () => {
        const testMail = `testAddUser${uuidv4()}@test.fr`;
        // @ts-ignore
        const response = await usersResolver.Mutation.adminAddUser(
          undefined,
          {
            input: {
              email: testMail,
              password: DEFAULT_ADMIN_PASSWORD,
            } as AddUserInput,
          },
          contextAdminUser
        );
        expect(response).toBeTruthy();

        user = await loadUserBy({ 'User.id': response.id });
        // @ts-expect-error organizations is not considered as callable
        organizations = await usersResolver.User.organizations(
          user,
          undefined,
          contextAdminUser,
          undefined
        );
      });
      it('should have only one organization Personal space', async () => {
        expect(organizations.length).toEqual(1);
      });

      it('should User.Id is equal to Organization.Id', async () => {
        expect(user.id).toEqual(organizations[0].id);
      });
    });

    describe('as Admin - should create user with personal space and add to internal organization', async () => {
      let response;
      let organizations: Organization[];
      let user: UserLoadUserBy;
      beforeAll(async () => {
        const testMail = `testAddUser${uuidv4()}@test.fr`;
        // @ts-ignore
        response = await usersResolver.Mutation.adminAddUser(
          undefined,
          {
            input: {
              email: testMail,
              password: DEFAULT_ADMIN_PASSWORD,
              organization_capabilities: [
                {
                  organization_id: toGlobalId(
                    'Organization',
                    PLATFORM_ORGANIZATION_UUID
                  ),
                  capabilities: [],
                },
              ],
            } as AddUserInput,
          },
          contextAdminUser
        );
        expect(response).toBeTruthy();
        user = await loadUserBy({ 'User.id': response.id });
        organizations = await usersResolver.User.organizations(
          user,
          undefined,
          contextAdminUser,
          undefined
        );
      });

      it('should have Personal space and Internal as organization', async () => {
        expect(
          organizations.some((org) => org.id === PLATFORM_ORGANIZATION_UUID)
        ).toBeTruthy();
        expect(
          organizations.some((org) => org.id.toString() === user.id.toString())
        ).toBeTruthy();

        expect(organizations.length).toEqual(2);
      });

      afterAll(async () => {
        await deleteUserById(response.id as UserId);
      });
    });
    it('as Admin Organization - should not able to create user with different email domain', async () => {
      const testMail = `testAddUser${uuidv4()}@test.fr`;
      try {
        requestContext.set(requestContextThalesUser);
        // @ts-ignore
        await usersResolver.Mutation.adminAddUser(
          undefined,
          {
            input: {
              email: testMail,
              password: DEFAULT_ADMIN_PASSWORD,
              organization_capabilities: [
                {
                  organization_id: toGlobalId('Organization', THALES_ORGA_ID),
                  capabilities: [],
                },
              ],
            } as AddUserInput,
          },
          contextAdminOrgaThales
        );
      } catch (error) {
        const user = await loadUserBy({ 'User.email': testMail });
        expect(user).toBeFalsy();
        expect(error).toBeTruthy();
      }
    });
    describe('as Admin orga - should create user with personal space and add to Thales organization', async () => {
      let user: UserLoadUserBy;
      let organizations: Organization[];
      let response;
      beforeAll(async () => {
        const testMail = `testAddUser${uuidv4()}@thales.com`;
        requestContext.set(requestContextThalesUser);
        // @ts-ignore
        response = await usersResolver.Mutation.adminAddUser(
          undefined,
          {
            input: {
              email: testMail,
              password: DEFAULT_ADMIN_PASSWORD,
              organization_capabilities: [
                {
                  organization_id: toGlobalId('Organization', THALES_ORGA_ID),
                  capabilities: [],
                },
              ],
            } as AddUserInput,
          },
          contextAdminOrgaThales
        );
        user = await loadUserBy({ 'User.id': response.id });

        requestContext.set(requestContextAdminUser);
        organizations = await usersResolver.User.organizations(
          user,
          undefined,
          contextAdminUser,
          undefined
        );

        expect(response).toBeTruthy();
      });

      it('should have Personal space and Thales as organization', async () => {
        expect(
          organizations.some((org) => org.id === THALES_ORGA_ID)
        ).toBeTruthy();
        expect(
          organizations.some((org) => org.id.toString() === user.id.toString())
        ).toBeTruthy();

        expect(organizations.length).toEqual(2);
      });

      afterAll(async () => {
        await deleteUserById(response.id as UserId);
      });
    });
  });

  describe('adminEditUser', () => {
    let thalesUser: UserLoadUserBy;

    describe('existing user edition', async () => {
      let fallbackUser: UserLoadUserBy;
      let response;
      beforeAll(async () => {
        fallbackUser = await loadUserBy({ email: 'user15@test.fr' });

        // @ts-ignore
        response = await usersResolver.Mutation.adminEditUser(
          undefined,
          {
            id: SIMPLE_USER_FILIGRAN_ID,
            input: {
              organization_capabilities: [
                {
                  organization_id: toGlobalId(
                    'Organization',
                    SIMPLE_USER_FILIGRAN_ID
                  ),
                  capabilities: [
                    OrganizationCapability.ManageAccess,
                    OrganizationCapability.ManageSubscription,
                  ],
                },
                {
                  organization_id: toGlobalId(
                    'Organization',
                    PLATFORM_ORGANIZATION_UUID
                  ),
                  capabilities: [
                    OrganizationCapability.ManageAccess,
                    OrganizationCapability.ManageSubscription,
                  ],
                },
                {
                  organization_id: toGlobalId('Organization', THALES_ORGA_ID),
                  capabilities: [],
                },
              ],
            } as AdminEditUserInput,
          },
          contextAdminUser
        );

        expect(response).toBeTruthy();
      });

      afterAll(async () => {
        // @ts-ignore
        await usersResolver.Mutation.adminEditUser(
          undefined,
          {
            id: SIMPLE_USER_FILIGRAN_ID,
            input: {
              organization_capabilities: [
                {
                  organization_id: toGlobalId(
                    'Organization',
                    SIMPLE_USER_FILIGRAN_ID
                  ),
                  capabilities: [
                    OrganizationCapability.ManageAccess,
                    OrganizationCapability.ManageSubscription,
                  ],
                },
                {
                  organization_id: toGlobalId(
                    'Organization',
                    PLATFORM_ORGANIZATION_UUID
                  ),
                  capabilities: [
                    OrganizationCapability.ManageAccess,
                    OrganizationCapability.ManageSubscription,
                  ],
                },
              ],
            } as AdminEditUserInput,
          },
          contextAdminUser
        );
      });

      it('should have update organisations, first_name and last_name', async () => {
        expect(response.organization_capabilities.length).toEqual(3);
      });
      it('should not have update other fields', async () => {
        expect(fallbackUser.first_name).toEqual(response.first_name);
        expect(fallbackUser.email).toEqual(response.email);
      });
    });

    describe('administrator deletion', async () => {
      beforeAll(async () => {
        thalesUser = await loadUserBy({ email: THALES_ADMIN_ORGA_EMAIL });
      });

      afterEach(async () => {
        // @ts-expect-error adminEditUser is not considered as callable
        await usersResolver.Mutation.adminEditUser(
          undefined,
          {
            id: THALES_ADMIN_ORGA_USER_ID,
            input: {
              organization_capabilities:
                thalesUser.organization_capabilities.map(
                  (organizationCapabilities) => ({
                    organization_id: toGlobalId(
                      'Organization',
                      organizationCapabilities.organization.id
                    ),
                    capabilities: organizationCapabilities.capabilities,
                  })
                ),
            },
          },
          contextAdminUser
        );
      });

      it('should prevent deletion of the last organization administrator', async () => {
        // @ts-expect-error adminEditUser is not considered as callable
        const call = usersResolver.Mutation.adminEditUser(
          undefined,
          {
            id: THALES_ADMIN_ORGA_USER_ID,
            input: {
              organization_capabilities: [
                {
                  organization_id: toGlobalId('Organization', THALES_ORGA_ID),
                  capabilities: [],
                },
              ],
            } as AdminEditUserInput,
          },
          contextAdminUser
        );

        await expect(call).rejects.toThrow('CANT_REMOVE_LAST_ADMINISTRATOR');
      });
    });
  });

  describe('editUserCapabilities', () => {
    let thalesUser: UserLoadUserBy;

    beforeAll(async () => {
      thalesUser = await loadUserBy({ email: THALES_ADMIN_ORGA_EMAIL });
    });

    afterEach(async () => {
      requestContext.set(requestContextAdminUser);
      await usersResolver.Mutation.adminEditUser(
        undefined,
        {
          id: THALES_ADMIN_ORGA_USER_ID,
          input: {
            organization_capabilities: thalesUser.organization_capabilities.map(
              (organizationCapabilities) => ({
                organization_id: toGlobalId(
                  'Organization',
                  organizationCapabilities.organization.id
                ),
                capabilities: organizationCapabilities.capabilities,
              })
            ),
          },
        },
        contextAdminUser,
        undefined
      );
    });

    it('should prevent deletion of the last organization administrator', async () => {
      const testContext = {
        ...contextAdminUser,
        user: {
          ...contextAdminUser.user,
          selected_organization_id: THALES_ORGA_ID,
        },
      };
      requestContext.set({
        user: testContext.user,
        portalContext: testContext,
      });
      const call = usersResolver.Mutation.editUserCapabilities(
        undefined,
        {
          id: THALES_ADMIN_ORGA_USER_ID,
          input: { capabilities: [] },
        },
        testContext,
        undefined
      );

      await expect(call).rejects.toThrow('CANT_REMOVE_LAST_ADMINISTRATOR');
    });

    it('should edit capabilities', async () => {
      expect(thalesUser.selected_org_capabilities).not.to.includes(
        'MANAGE_PLATFORM_REGISTRATION'
      );

      const testContext = {
        ...contextAdminUser,
        user: {
          ...contextAdminUser.user,
          selected_organization_id: THALES_ORGA_ID,
        },
      };
      requestContext.set({
        user: testContext.user,
        portalContext: testContext,
      });
      await usersResolver.Mutation.editUserCapabilities(
        undefined,
        {
          id: THALES_ADMIN_ORGA_USER_ID,
          input: {
            capabilities: [
              'MANAGE_PLATFORM_REGISTRATION',
              'ADMINISTRATE_ORGANIZATION',
            ],
          },
        },
        testContext,
        undefined
      );
      thalesUser = await loadUserBy({ email: THALES_ADMIN_ORGA_EMAIL });
      expect(thalesUser.selected_org_capabilities).to.includes(
        'MANAGE_PLATFORM_REGISTRATION'
      );
      // Put back the original capabilities
      await usersResolver.Mutation.editUserCapabilities(
        undefined,
        {
          id: THALES_ADMIN_ORGA_USER_ID,
          input: {
            capabilities: ['ADMINISTRATE_ORGANIZATION'],
          },
        },
        testContext,
        undefined
      );
    });
    it('should accept a pending user to the organization', async () => {
      const testContext = {
        ...contextAdminUser,
        user: {
          ...contextAdminUser.user,
          selected_organization_id: THALES_ORGA_ID,
        },
      };
      requestContext.set({
        user: testContext.user,
        portalContext: testContext,
      });
      const pendingUser = await loginFromProvider({
        email: `testPending${uuidv4()}@thales.com`,
        first_name: 'test',
        last_name: 'pending',
        roles: [],
      });

      await usersResolver.Mutation.editUserCapabilities(
        undefined,
        {
          id: pendingUser.id,
          input: {
            capabilities: [
              'MANAGE_PLATFORM_REGISTRATION',
              'ADMINISTRATE_ORGANIZATION',
            ],
          },
        },
        testContext,
        undefined
      );
      const updatedUser = await loadUserBy({ email: pendingUser.email });

      expect(updatedUser.selected_org_capabilities).to.includes(
        'ADMINISTRATE_ORGANIZATION'
      );
      const usersPendingOrg =
        await UserOrganizationPendingDomain.loadUserOrganizationPending({
          user_id: updatedUser.id,
        });
      expect(usersPendingOrg.length).toBe(0);

      await removeUser({ email: pendingUser.email });
    });
  });
  describe('editMeUser', () => {
    let adminUser: UserLoadUserBy;
    let auth0Spy: MockInstance;
    beforeAll(async () => {
      adminUser = await loadUserBy({ email: DEFAULT_ADMIN_EMAIL });
      if (!adminUser) {
        throw new Error('admin user not found');
      }

      auth0Spy = vi.spyOn(auth0ClientMock, 'updateUser');
    });

    it('should edit user profile information on auth0 and locally', async () => {
      const newFirstName = 'Roger';
      const newLastName = 'Testeur';
      const newCountry = 'France';
      const newPicture =
        'https://www.labrouettemaraichere.com/cdn/shop/products/29109696c-www.fullstackgardener.com_720x.jpg';

      // @ts-expect-error editMeUser is not considered as callable
      const response = await usersResolver.Mutation.editMeUser(
        undefined,
        {
          input: {
            first_name: newFirstName,
            last_name: newLastName,
            country: newCountry,
            picture: newPicture,
          },
        },
        contextAdminUser
      );

      // assert response
      expect(response).toBeTruthy();

      expect(response.first_name).toEqual(newFirstName);
      expect(response.last_name).toEqual(newLastName);
      expect(response.country).toEqual(newCountry);
      expect(response.picture).toEqual(newPicture);

      // assert database
      const [dbUser] = await loadUser({ email: DEFAULT_ADMIN_EMAIL });
      expect(dbUser).toBeDefined();
      expect(dbUser?.first_name).toEqual(newFirstName);
      expect(dbUser?.last_name).toEqual(newLastName);
      expect(dbUser?.country).toEqual(newCountry);
      expect(dbUser?.picture).toEqual(newPicture);

      // assert auth0 call
      expect(auth0Spy).toBeCalledWith({
        email: DEFAULT_ADMIN_EMAIL,
        first_name: newFirstName,
        last_name: newLastName,
        country: newCountry,
        picture: newPicture,
      });
    });

    afterAll(async () => {
      requestContext.set(requestContextAdminUser);
      // @ts-expect-error editMeUser is not considered as callable
      await usersResolver.Mutation.editMeUser(
        undefined,
        {
          input: {
            first_name: adminUser.first_name,
            last_name: adminUser.last_name,
            country: adminUser.country,
            picture: adminUser.picture,
          },
        },
        contextAdminUser
      );

      auth0Spy.mockReset();
    });
  });

  describe('resetPassword', () => {
    let auth0Spy: MockInstance;
    beforeAll(() => {
      auth0Spy = vi.spyOn(auth0ClientMock, 'resetPassword');
    });

    it('should call auth0 to reset password', async () => {
      // @ts-expect-error resetPassword is not considered as callable
      const response = await usersResolver.Mutation.resetPassword(
        undefined,
        {},
        contextAdminUser
      );

      expect(response).toBeTruthy();
      expect(response.success).toBeTruthy();
      expect(auth0Spy).toBeCalledWith(DEFAULT_ADMIN_EMAIL);
    });

    afterAll(() => {
      auth0Spy.mockReset();
    });
  });

  describe('removePendingUserFromOrganization', () => {
    it('should remove a pending user from organization', async () => {
      const testContext = {
        ...contextAdminUser,
        user: {
          ...contextAdminUser.user,
          selected_organization_id: THALES_ORGA_ID,
        },
      };
      requestContext.set({
        user: testContext.user,
        portalContext: testContext,
      });
      const email = `testPending${uuidv4()}@thales.com`;
      const pendingUser = await loginFromProvider({
        email: email,
        first_name: 'testToRemove',
        last_name: 'pending',
        roles: [],
      });

      const userId = toGlobalId('User', pendingUser.id);
      const organizationId = toGlobalId('Organization', THALES_ORGA_ID);

      await usersResolver.Mutation.removePendingUserFromOrganization(
        undefined,
        {
          user_id: userId,
          organization_id: organizationId,
        },
        testContext,
        undefined
      );

      const usersPendingOrg =
        await UserOrganizationPendingDomain.loadUserOrganizationPending({
          user_id: pendingUser.id,
        });

      expect(usersPendingOrg.length).toBe(0);
      await removeUser({ email: pendingUser.email });
    });

    it('should dispatch event when pending user is removed from organization', async () => {
      const testContext = {
        ...contextAdminOrgaThales,
        user: {
          ...contextAdminOrgaThales.user,
          selected_organization_id: THALES_ORGA_ID,
        },
      };
      requestContext.set({
        user: testContext.user,
        portalContext: testContext,
      });
      const email = `testPending${uuidv4()}@thales.com`;
      const pendingUser = await loginFromProvider({
        email: email,
        first_name: 'testToRemove',
        last_name: 'pending',
        roles: [],
      });
      const userId = toGlobalId('User', pendingUser.id);
      const organizationId = toGlobalId('Organization', THALES_ORGA_ID);
      const subscriptionSpy = new SubscriptionSpy();
      await subscriptionSpy.spy(
        usersResolver.Subscription?.UserPending,
        {
          organizationId: organizationId,
        },
        contextAdminOrgaThales,
        ['delete']
      );

      await usersResolver.Mutation.removePendingUserFromOrganization(
        undefined,
        {
          user_id: userId,
          organization_id: organizationId,
        },
        testContext,
        undefined
      );

      const events = await subscriptionSpy.waitForEvents(1);
      expect(events).toHaveLength(1);
      expect(events[0].UserPending.delete.email).toBe(email);

      await removeUser({ email: pendingUser.email });
      await subscriptionSpy.cleanup();
    });
  });
  describe('bulkRemovePendingUserFromOrganization', () => {
    it('should remove pending users from organization', async () => {
      const email = `testPending${uuidv4()}@thales.com`;
      const pendingUser = await loginFromProvider({
        email: email,
        first_name: 'testToRemove',
        last_name: 'pending',
        roles: [],
      });

      const testContext = {
        ...contextAdminOrgaThales,
        user: {
          ...contextAdminOrgaThales.user,
          selected_organization_id: THALES_ORGA_ID,
        },
      };
      requestContext.set({
        user: testContext.user,
        portalContext: testContext,
      });

      await usersResolver.Mutation?.bulkRemovePendingUserFromOrganization!(
        {},
        {
          input: {
            ids: [],
            searchTerm: undefined,
            filters: [],
            excludedIds: [],
          },
        },
        testContext,
        {} as GraphQLResolveInfo
      );

      const usersPendingOrg =
        await UserOrganizationPendingDomain.loadUserOrganizationPending({
          user_id: pendingUser.id,
        });

      expect(usersPendingOrg.length).toBe(0);
      await removeUser({ email: pendingUser.email });
    });

    it('should dispatch event when pending users are removed from organization', async () => {
      const email = `testPending${uuidv4()}@thales.com`;
      const pendingUser = await loginFromProvider({
        email: email,
        first_name: 'testToRemove',
        last_name: 'pending',
        roles: [],
      });

      const testContext = {
        ...contextAdminOrgaThales,
        user: {
          ...contextAdminOrgaThales.user,
          selected_organization_id: THALES_ORGA_ID,
        },
      };
      requestContext.set({
        user: testContext.user,
        portalContext: testContext,
      });

      const organizationId = toGlobalId('Organization', THALES_ORGA_ID);
      const subscriptionSpy = new SubscriptionSpy();
      await subscriptionSpy.spy(
        usersResolver.Subscription?.UserPending,
        {
          organizationId: organizationId,
        },
        contextAdminOrgaThales,
        ['invalidate']
      );

      await usersResolver.Mutation?.bulkRemovePendingUserFromOrganization!(
        {},
        {
          input: {
            ids: [],
            searchTerm: undefined,
            filters: [],
            excludedIds: [],
          },
        },
        testContext,
        {} as GraphQLResolveInfo
      );

      const events = await subscriptionSpy.waitForEvents(1);
      expect(events).toHaveLength(1);
      expect(events[0].UserPending.invalidate.id).toBe(THALES_ORGA_ID);

      await removeUser({ email: pendingUser.email });
      await subscriptionSpy.cleanup();
    });
  });
});
