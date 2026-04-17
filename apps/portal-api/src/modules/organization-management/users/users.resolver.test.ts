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
import { SubscriptionSpy } from '../../../../tests/test-utils';
import {
  contextAdminSecondOrga,
  // eslint-disable-next-line no-restricted-imports
  contextBypassUser,
  contextSimpleUserFiligran2,
  contextSimpleUserSecondOrga,
  requestContextAdminSecondOrga,
  // eslint-disable-next-line no-restricted-imports
  requestContextAdminUser,
  requestContextSimpleUserSecondOrga,
  SERVICES,
  TEST_ORGANIZATIONS,
} from '../../../../tests/tests.const';
import {
  AddUserInput,
  AdminEditUserInput,
  OrderingMode,
  Organization,
  OrganizationCapability,
  UserOrdering,
} from '../../../__generated__/resolvers-types';
import { requestContext } from '../../../context/request.context';
import { SubscriptionId } from '../../../model/kanel/public/Subscription';
import { UserId } from '../../../model/kanel/public/User';
import { UserLoadUserBy } from '../../../model/user';
import { auth0ClientMock } from '../../../thirdparty/auth0/mock';
import * as UserOrganizationDomain from '../../common/user-organization.domain';
import { loginFromProvider } from '../../security-management/authentication/auth-user';
import {
  deleteSubscription,
  insertSubscription,
} from '../../subscription/subscription.helper';
import {
  deleteUserById,
  loadUser,
  loadUserBy,
} from './user-domain/users.domain';
import { UserOrganizationPendingDomain } from './user-pending/user-organization-pending.domain';
import { removeUser } from './users.helper';
import usersResolver from './users.resolver';

const SUBSCRIPTION_ID = '7c6e887e-9553-439b-aeaf-a81911c399d2';
const RANDOM_ORGA_ID = '681fb117-e2c3-46d3-945a-0e921b5d4b6d';

describe('user query resolver', () => {
  describe('userHasOrganizationWithSubscription', () => {
    beforeEach(async () => {
      await insertSubscription({
        id: SUBSCRIPTION_ID,
        organization_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        service_instance_id: SERVICES.INSTANCES.EPIC.ID,
      });
    });

    afterEach(async () => {
      await deleteSubscription({
        id: SUBSCRIPTION_ID as SubscriptionId,
      });
    });

    it.each`
      expected | organizations                                                                                                                                                                                     | description
      ${true}  | ${[{ id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID, name: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.NAME, personal_space: false, domains: [TEST_ORGANIZATIONS.SECOND_ORGANIZATION.DOMAINS.FIRST] }]} | ${'organization has subscription'}
      ${false} | ${[]}                                                                                                                                                                                             | ${'has no organization'}
      ${false} | ${[{ id: RANDOM_ORGA_ID, name: 'Other', personal_space: false, domains: [TEST_ORGANIZATIONS.SECOND_ORGANIZATION.DOMAINS.FIRST] }]}                                                                | ${'no organization has subscription'}
    `(
      'should return $expected if $description',
      async ({ expected, organizations }) => {
        const currentContext = {
          ...contextAdminSecondOrga,
          user: {
            ...contextAdminSecondOrga.user,
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
  });

  describe('listPendingUser', () => {
    it('should list pending users from any organization for bypass', async () => {
      const testContext = {
        ...contextBypassUser,
        user: {
          ...contextBypassUser.user,
          selected_organization_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        },
      };
      requestContext.set({
        user: testContext.user,
        portalContext: testContext,
      });
      const email = `testPending${uuidv4()}@second-orga.com`;
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
        ...contextAdminSecondOrga,
        user: {
          ...contextAdminSecondOrga.user,
          selected_organization_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        },
      };
      const pendingUserSecondOrga = await loginFromProvider({
        email: `testPending${uuidv4()}@second-orga.com`,
        first_name: 'secondOrga',
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
            value: [
              toGlobalId(
                'Organization',
                TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID
              ),
            ],
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
      expect(response.edges[0].node.id).toBe(pendingUserSecondOrga.id);

      requestContext.set(requestContextAdminUser);
      await removeUser({ email: pendingUserSecondOrga.email });
      await removeUser({ email: pendingUserFiligran.email });
    });
    it('should list pending users in the user orga even if no filter is specified', async () => {
      const testContext = {
        ...contextAdminSecondOrga,
        user: {
          ...contextAdminSecondOrga.user,
          selected_organization_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        },
      };
      const pendingUserSecondOrga = await loginFromProvider({
        email: `testPending${uuidv4()}@second-orga.com`,
        first_name: 'secondOrga',
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
      expect(response.edges[0].node.id).toBe(pendingUserSecondOrga.id);

      requestContext.set(requestContextAdminUser);
      await removeUser({ email: pendingUserSecondOrga.email });
      await removeUser({ email: pendingUserFiligran.email });
    });
  });
});

describe('user mutation resolver', () => {
  it('should be login', async () => {
    // When
    // @ts-ignore
    const response = await usersResolver.Mutation.login(
      undefined,
      {
        email: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.EMAIL,
        password: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.PASSWORD,
      },
      {
        req: {
          session: {
            user: {},
          },
        },
      }
    );
    // Then
    expect(response).toBeTruthy();
  });

  describe('adminAddUser', () => {
    it('should not create an existing user', async () => {
      // Given
      try {
        // @ts-ignore
        await usersResolver.Mutation.adminAddUser(
          undefined,
          {
            input: {
              email: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.EMAIL,
              password: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.PASSWORD,
            } as AddUserInput,
          },
          contextBypassUser
        );
      } catch (error) {
        // Should throw an error and catch it.
        // As we do not use a running server we need to catch the error
        // otherwise it would be send in the graphql response as an error.
        expect(error).toBeTruthy();
      }
    });
    it('should not partially create a user if an error occurs', async () => {
      // Given
      const testEmail = 'testRollback@company.com';
      try {
        vi.spyOn(
          UserOrganizationDomain,
          'updateMultipleUserOrgWithCapabilities'
        ).mockImplementation(() => {
          throw new Error('Test error');
        });
        const testEmail = 'testRollback@company.com';
        // When
        // @ts-ignore
        await mutationResolver.adminAddUser(
          undefined,
          {
            input: {
              email: testEmail,
              password: 'fake password',
            } as AddUserInput,
          },
          contextBypassUser
        );
      } catch (error) {
        // Then
        // Should throw an error and catch it.
        // As we do not use a running server we need to catch the error
        // otherwise it would be send in the graphql response as an error.
        expect(error).toBeTruthy();
      }
      const user = await loadUserBy({ 'User.email': testEmail });
      expect(user).toBeUndefined();
    });

    it('should should send a add event in sse', async () => {
      // Given
      const filigranSpy = new SubscriptionSpy();
      const secondOrgaSpy = new SubscriptionSpy();
      // @ts-ignore
      await filigranSpy.spy(
        usersResolver.Subscription.User,
        {
          organizationId: toGlobalId(
            'Organization',
            TEST_ORGANIZATIONS.FILIGRAN.ID
          ),
        },
        contextBypassUser,
        ['add']
      );

      await secondOrgaSpy.spy(
        usersResolver.Subscription.User,
        {
          organizationId: toGlobalId(
            'Organization',
            TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID
          ),
        },
        contextAdminSecondOrga,
        ['add']
      );

      const email = 'sseEventAddUser@filigran.io';
      // When

      // @ts-ignore
      await usersResolver.Mutation.adminAddUser(
        undefined,
        {
          input: {
            email: email,
            password: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.PASSWORD,
            organization_capabilities: [
              {
                organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
                capabilities: [],
              },
            ],
          } as AddUserInput,
        },
        contextBypassUser
      );

      // Then
      const events = await filigranSpy.waitForEvents(1);

      expect(events).toHaveLength(1);
      expect(events[0].User.add.email).toBe(email);
      await secondOrgaSpy.expectNoEvents();

      await filigranSpy.cleanup();
      await secondOrgaSpy.cleanup();
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
              password: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.PASSWORD,
            } as AddUserInput,
          },
          contextBypassUser
        );
        expect(response).toBeTruthy();

        user = await loadUserBy({ 'User.id': response.id });
        // @ts-expect-error organizations is not considered as callable
        organizations = await usersResolver.User.organizations(
          user,
          undefined,
          contextBypassUser,
          undefined
        );
      });
      it('should have only one organization Personal space', async () => {
        expect(organizations).toHaveLength(1);
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
        requestContext.set(requestContextAdminUser);

        const testMail = `testAddUser${uuidv4()}@${TEST_ORGANIZATIONS.FILIGRAN.DOMAINS.FIRST}.fr`;
        // @ts-ignore
        response = await usersResolver.Mutation.adminAddUser(
          undefined,
          {
            input: {
              email: testMail,
              password: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.PASSWORD,
              organization_capabilities: [
                {
                  organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
                  capabilities: [],
                },
              ],
            } as AddUserInput,
          },
          contextBypassUser
        );
        expect(response).toBeTruthy();
        user = await loadUserBy({ 'User.id': response.id });
        organizations = await usersResolver.User.organizations(
          user,
          undefined,
          contextBypassUser,
          undefined
        );
      });

      afterAll(async () => {
        if (response) await deleteUserById(response.id as UserId);
      });

      it('should have Personal space and Internal as organization', async () => {
        expect(
          organizations.some((org) => org.id === TEST_ORGANIZATIONS.FILIGRAN.ID)
        ).toBeTruthy();
        expect(
          organizations.some((org) => org.id.toString() === user.id.toString())
        ).toBeTruthy();

        expect(organizations).toHaveLength(2);
      });
    });
    it('as Admin Organization - should not able to create user with different email domain', async () => {
      const testMail = `testAddUser${uuidv4()}@test.fr`;
      try {
        requestContext.set(requestContextAdminSecondOrga);
        // @ts-ignore
        await mutationResolver.adminAddUser(
          undefined,
          {
            input: {
              email: testMail,
              password: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.PASSWORD,
              organization_capabilities: [
                {
                  organization_id: toGlobalId(
                    'Organization',
                    TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID
                  ),
                  capabilities: [],
                },
              ],
            } as AddUserInput,
          },
          contextAdminSecondOrga
        );
      } catch (error) {
        const user = await loadUserBy({ 'User.email': testMail });
        expect(user).toBeFalsy();
        expect(error).toBeTruthy();
      }
    });
    describe('as Admin orga - should create user with personal space and add to ORGANIZATIONS_TEST.SECOND_ORGANIZATION.NAME organization', async () => {
      let user: UserLoadUserBy;
      let organizations: Organization[];
      let response;
      beforeAll(async () => {
        const testMail = `testAddUser${uuidv4()}@second-orga.com`;
        requestContext.set(requestContextAdminSecondOrga);
        // @ts-ignore
        response = await usersResolver.Mutation.adminAddUser(
          undefined,
          {
            input: {
              email: testMail,
              password: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.PASSWORD,
              organization_capabilities: [
                {
                  organization_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
                  capabilities: [],
                },
              ],
            } as AddUserInput,
          },
          contextAdminSecondOrga
        );
        user = await loadUserBy({ 'User.id': response.id });

        requestContext.set(requestContextAdminUser);
        organizations = await usersResolver.User.organizations(
          user,
          undefined,
          contextAdminSecondOrga,
          undefined
        );

        expect(response).toBeTruthy();
      });

      afterAll(async () => {
        await deleteUserById(response.id as UserId);
      });

      it('should have Personal space and ORGANIZATIONS_TEST.SECOND_ORGANIZATION.NAME as organization', async () => {
        expect(
          organizations.some(
            (org) => org.id === TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID
          )
        ).toBeTruthy();
        expect(
          organizations.some((org) => org.id.toString() === user.id.toString())
        ).toBeTruthy();

        expect(organizations).toHaveLength(2);
      });
    });
  });

  describe('adminEditUser', () => {
    let secondOrgaUser: UserLoadUserBy;

    describe('existing user edition', async () => {
      let fallbackUser: UserLoadUserBy;
      let response;
      beforeAll(async () => {
        fallbackUser = await loadUserBy({ email: 'user15@test.fr' });

        // @ts-ignore
        response = await usersResolver.Mutation.adminEditUser(
          undefined,
          {
            id: TEST_ORGANIZATIONS.FILIGRAN.USERS.SIMPLE.ID,
            input: {
              organization_capabilities: [
                {
                  organization_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.SIMPLE.ID,
                  capabilities: [
                    OrganizationCapability.ManageAccess,
                    OrganizationCapability.ManageSubscription,
                  ],
                },
                {
                  organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
                  capabilities: [
                    OrganizationCapability.ManageAccess,
                    OrganizationCapability.ManageSubscription,
                  ],
                },
                {
                  organization_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
                  capabilities: [],
                },
              ],
            } as AdminEditUserInput,
          },
          contextBypassUser
        );

        expect(response).toBeTruthy();
      });

      afterAll(async () => {
        // @ts-ignore
        await usersResolver.Mutation.adminEditUser(
          undefined,
          {
            id: TEST_ORGANIZATIONS.FILIGRAN.USERS.SIMPLE.ID,
            input: {
              organization_capabilities: [
                {
                  organization_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.SIMPLE.ID,
                  capabilities: [
                    OrganizationCapability.ManageAccess,
                    OrganizationCapability.ManageSubscription,
                  ],
                },
                {
                  organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
                  capabilities: [
                    OrganizationCapability.ManageAccess,
                    OrganizationCapability.ManageSubscription,
                  ],
                },
              ],
            } as AdminEditUserInput,
          },
          contextBypassUser
        );
      });

      it('should have update organisations, first_name and last_name', async () => {
        expect(response.organization_capabilities).toHaveLength(3);
      });
      it('should not have update other fields', async () => {
        expect(fallbackUser.first_name).toEqual(response.first_name);
        expect(fallbackUser.email).toEqual(response.email);
      });
    });

    describe('administrator deletion', async () => {
      beforeAll(async () => {
        secondOrgaUser = await loadUserBy({
          email: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.ADMIN_ORGA.EMAIL,
        });
      });

      afterEach(async () => {
        // @ts-expect-error adminEditUser is not considered as callable
        await usersResolver.Mutation.adminEditUser(
          undefined,
          {
            id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.ADMIN_ORGA.ID,
            input: {
              organization_capabilities:
                secondOrgaUser.organization_capabilities.map(
                  (organizationCapabilities) => ({
                    organization_id: organizationCapabilities.organization.id,
                    capabilities: organizationCapabilities.capabilities,
                  })
                ),
            },
          },
          contextBypassUser
        );
      });

      it('should prevent deletion of the last organization administrator', async () => {
        // @ts-expect-error adminEditUser is not considered as callable
        const call = usersResolver.Mutation.adminEditUser(
          undefined,
          {
            id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.ADMIN_ORGA.ID,
            input: {
              organization_capabilities: [
                {
                  organization_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
                  capabilities: [],
                },
              ],
            } as AdminEditUserInput,
          },
          contextBypassUser
        );

        await expect(call).rejects.toThrow('CANT_REMOVE_LAST_ADMINISTRATOR');
      });
    });
  });

  describe('editUserCapabilities', () => {
    let secondOrgaUser: UserLoadUserBy;

    beforeAll(async () => {
      secondOrgaUser = await loadUserBy({
        email: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.ADMIN_ORGA.EMAIL,
      });
    });

    afterEach(async () => {
      requestContext.set(requestContextAdminUser);
      await usersResolver.Mutation.adminEditUser(
        undefined,
        {
          id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.ADMIN_ORGA.ID,
          input: {
            organization_capabilities:
              secondOrgaUser.organization_capabilities.map(
                (organizationCapabilities) => ({
                  organization_id: organizationCapabilities.organization.id,
                  capabilities: organizationCapabilities.capabilities,
                })
              ),
          },
        },
        contextBypassUser,
        undefined
      );
    });

    it('should prevent deletion of the last organization administrator', async () => {
      const testContext = {
        ...contextBypassUser,
        user: {
          ...contextBypassUser.user,
          selected_organization_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        },
      };
      requestContext.set({
        user: testContext.user,
        portalContext: testContext,
      });
      const call = usersResolver.Mutation.editUserCapabilities(
        undefined,
        {
          id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.ADMIN_ORGA.ID,
          input: { capabilities: [] },
        },
        testContext,
        undefined
      );

      await expect(call).rejects.toThrow('CANT_REMOVE_LAST_ADMINISTRATOR');
    });

    it('should edit capabilities', async () => {
      expect(secondOrgaUser.selected_org_capabilities).not.toContain(
        'MANAGE_PLATFORM_REGISTRATION'
      );

      const testContext = {
        ...contextAdminSecondOrga,
        user: {
          ...contextAdminSecondOrga.user,
          selected_organization_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        },
      };
      requestContext.set({
        user: testContext.user,
        portalContext: testContext,
      });
      await usersResolver.Mutation.editUserCapabilities(
        undefined,
        {
          id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.ADMIN_ORGA.ID,
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
      secondOrgaUser = await loadUserBy({
        email: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.ADMIN_ORGA.EMAIL,
      });
      expect(secondOrgaUser.selected_org_capabilities).toContain(
        'MANAGE_PLATFORM_REGISTRATION'
      );
      // Put back the original capabilities
      await usersResolver.Mutation.editUserCapabilities(
        undefined,
        {
          id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.ADMIN_ORGA.ID,
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
        ...contextAdminSecondOrga,
        user: {
          ...contextAdminSecondOrga.user,
          selected_organization_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        },
      };
      requestContext.set({
        user: testContext.user,
        portalContext: testContext,
      });
      const pendingUser = await loginFromProvider({
        email: `testPending${uuidv4()}@second-orga.com`,
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

      expect(updatedUser.selected_org_capabilities).toContain(
        'ADMINISTRATE_ORGANIZATION'
      );
      const usersPendingOrg =
        await UserOrganizationPendingDomain.loadUserOrganizationPending({
          user_id: updatedUser.id,
        });
      expect(usersPendingOrg).toHaveLength(0);

      await removeUser({ email: pendingUser.email });
    });
  });
  describe('editMeUser', () => {
    let simpleUserSecondOrga: UserLoadUserBy;
    let auth0Spy: MockInstance;
    beforeAll(async () => {
      simpleUserSecondOrga = await loadUserBy({
        email: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.SIMPLE.EMAIL,
      });
      if (!simpleUserSecondOrga) {
        throw new Error('simple user second orga not found');
      }
      requestContext.set(requestContextSimpleUserSecondOrga);

      auth0Spy = vi.spyOn(auth0ClientMock, 'updateUser');
    });

    afterAll(async () => {
      // @ts-expect-error editMeUser is not considered as callable
      await usersResolver.Mutation.editMeUser(
        undefined,
        {
          input: {
            first_name: simpleUserSecondOrga.first_name,
            last_name: simpleUserSecondOrga.last_name,
            country: simpleUserSecondOrga.country,
            picture: simpleUserSecondOrga.picture,
          },
        },
        contextSimpleUserSecondOrga
      );

      auth0Spy.mockReset();
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
        contextSimpleUserSecondOrga
      );

      // assert response
      expect(response).toMatchObject({
        first_name: newFirstName,
        last_name: newLastName,
        country: newCountry,
        picture: newPicture,
      });

      // assert database
      const [dbUser] = await loadUser({
        email: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.SIMPLE.EMAIL,
      });
      expect(dbUser).toMatchObject({
        first_name: newFirstName,
        last_name: newLastName,
        country: newCountry,
        picture: newPicture,
      });

      // assert auth0 call
      expect(auth0Spy).toBeCalledWith({
        email: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.SIMPLE.EMAIL,
        first_name: newFirstName,
        last_name: newLastName,
        country: newCountry,
        picture: newPicture,
      });
    });
  });

  describe('resetPassword', () => {
    let auth0Spy: MockInstance;
    beforeAll(() => {
      auth0Spy = vi.spyOn(auth0ClientMock, 'resetPassword');
    });

    afterAll(() => {
      auth0Spy.mockReset();
    });

    it('should call auth0 to reset password', async () => {
      // When
      // @ts-expect-error resetPassword is not considered as callable
      const response = await usersResolver.Mutation.resetPassword(
        undefined,
        {},
        contextSimpleUserFiligran2
      );

      // Then
      expect(response).toBeTruthy();
      expect(response.success).toBeTruthy();
      expect(auth0Spy).toBeCalledWith(
        TEST_ORGANIZATIONS.FILIGRAN.USERS.SIMPLE2.EMAIL
      );
    });
  });

  describe('removePendingUserFromOrganization', () => {
    it('should remove a pending user from organization', async () => {
      // Given
      const testContext = {
        ...contextAdminSecondOrga,
        user: {
          ...contextAdminSecondOrga.user,
          selected_organization_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        },
      };
      requestContext.set({
        user: testContext.user,
        portalContext: testContext,
      });
      const email = `testPending${uuidv4()}@second-orga.com`;
      const pendingUser = await loginFromProvider({
        email: email,
        first_name: 'testToRemove',
        last_name: 'pending',
        roles: [],
      });

      const userId = toGlobalId('User', pendingUser.id);
      const organizationId = TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID;
      // When
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

      // Then
      expect(usersPendingOrg).toHaveLength(0);
      await removeUser({ email: pendingUser.email });
    });

    it('should dispatch event when pending user is removed from organization', async () => {
      const testContext = {
        ...contextAdminSecondOrga,
        user: {
          ...contextAdminSecondOrga.user,
          selected_organization_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        },
      };
      requestContext.set({
        user: testContext.user,
        portalContext: testContext,
      });
      const email = `testPending${uuidv4()}@second-orga.com`;
      const pendingUser = await loginFromProvider({
        email: email,
        first_name: 'testToRemove',
        last_name: 'pending',
        roles: [],
      });
      const userId = toGlobalId('User', pendingUser.id);
      const organizationId = TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID;
      const subscriptionSpy = new SubscriptionSpy();
      await subscriptionSpy.spy(
        usersResolver.Subscription?.UserPending,
        {
          organizationId: toGlobalId('Organization', organizationId),
        },
        contextAdminSecondOrga,
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
      const email = `testPending${uuidv4()}@second-orga.com`;
      const pendingUser = await loginFromProvider({
        email: email,
        first_name: 'testToRemove',
        last_name: 'pending',
        roles: [],
      });

      const testContext = {
        ...contextAdminSecondOrga,
        user: {
          ...contextAdminSecondOrga.user,
          selected_organization_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
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

      expect(usersPendingOrg).toHaveLength(0);
      await removeUser({ email: pendingUser.email });
    });

    it('should dispatch event when pending users are removed from organization', async () => {
      const email = `testPending${uuidv4()}@second-orga.com`;
      const pendingUser = await loginFromProvider({
        email: email,
        first_name: 'testToRemove',
        last_name: 'pending',
        roles: [],
      });

      const testContext = {
        ...contextAdminSecondOrga,
        user: {
          ...contextAdminSecondOrga.user,
          selected_organization_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        },
      };
      requestContext.set({
        user: testContext.user,
        portalContext: testContext,
      });

      const organizationId = toGlobalId(
        'Organization',
        TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID
      );
      const subscriptionSpy = new SubscriptionSpy();
      await subscriptionSpy.spy(
        usersResolver.Subscription?.UserPending,
        {
          organizationId: organizationId,
        },
        contextAdminSecondOrga,
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
      expect(events[0].UserPending.invalidate.id).toBe(
        TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID
      );

      await removeUser({ email: pendingUser.email });
      await subscriptionSpy.cleanup();
    });
  });
});
