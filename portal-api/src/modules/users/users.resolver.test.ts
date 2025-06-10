import { MockInstance } from '@vitest/spy';
import { toGlobalId } from 'graphql-relay/node/node';
import { v4 as uuidv4 } from 'uuid';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest';
import {
  contextAdminOrgaThales,
  contextAdminUser,
  DEFAULT_ADMIN_EMAIL,
  DEFAULT_ADMIN_PASSWORD,
  SERVICE_VAULT_ID,
  SIMPLE_USER_FILIGRAN_ID,
  THALES_EMAIL,
  THALES_ORGA_ID,
  THALES_USER_ID,
} from '../../../tests/tests.const';
import {
  AddUserInput,
  AdminEditUserInput,
  Organization,
} from '../../__generated__/resolvers-types';
import { SubscriptionId } from '../../model/kanel/public/Subscription';
import { UserId } from '../../model/kanel/public/User';
import { UserLoadUserBy } from '../../model/user';
import { ADMIN_UUID, PLATFORM_ORGANIZATION_UUID } from '../../portal.const';
import { auth0ClientMock } from '../../thirdparty/auth0/mock';
import { OrganizationCapabilityName } from '../common/user-organization-capability.const';
import {
  deleteSubscriptionUnsecure,
  insertUnsecureSubscription,
} from '../subcription/subscription.helper';
import { deleteUserById, loadUnsecureUserBy, loadUserBy } from './users.domain';
import usersResolver from './users.resolver';

const SUBSCRIPTION_ID = '7c6e887e-9553-439b-aeaf-a81911c399d2';
const RANDOM_ORGA_ID = '681fb117-e2c3-46d3-945a-0e921b5d4b6d';

describe('User query resolver', () => {
  describe('userHasOrganizationWithSubscription', () => {
    beforeEach(async () => {
      await insertUnsecureSubscription({
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
      await deleteSubscriptionUnsecure({
        id: SUBSCRIPTION_ID as SubscriptionId,
      });
    });
  });

  it('should fetch User', async () => {
    // @ts-ignore
    const response = await usersResolver.Query.user(
      {},
      { id: ADMIN_UUID },
      contextAdminUser
    );
    expect(response).toBeTruthy();
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
                    OrganizationCapabilityName.MANAGE_ACCESS,
                    OrganizationCapabilityName.MANAGE_SUBSCRIPTION,
                  ],
                },
                {
                  organization_id: toGlobalId(
                    'Organization',
                    PLATFORM_ORGANIZATION_UUID
                  ),
                  capabilities: [
                    OrganizationCapabilityName.MANAGE_ACCESS,
                    OrganizationCapabilityName.MANAGE_SUBSCRIPTION,
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
                    OrganizationCapabilityName.MANAGE_ACCESS,
                    OrganizationCapabilityName.MANAGE_SUBSCRIPTION,
                  ],
                },
                {
                  organization_id: toGlobalId(
                    'Organization',
                    PLATFORM_ORGANIZATION_UUID
                  ),
                  capabilities: [
                    OrganizationCapabilityName.MANAGE_ACCESS,
                    OrganizationCapabilityName.MANAGE_SUBSCRIPTION,
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
        thalesUser = await loadUserBy({ email: THALES_EMAIL });
      });

      afterEach(async () => {
        // @ts-expect-error adminEditUser is not considered as callable
        await usersResolver.Mutation.adminEditUser(
          undefined,
          {
            id: THALES_USER_ID,
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
            id: THALES_USER_ID,
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

  describe('editUser', () => {
    let thalesUser: UserLoadUserBy;

    beforeAll(async () => {
      thalesUser = await loadUserBy({ email: THALES_EMAIL });
    });

    afterEach(async () => {
      // @ts-expect-error adminEditUser is not considered as callable
      await usersResolver.Mutation.adminEditUser(
        undefined,
        {
          id: THALES_USER_ID,
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
        contextAdminUser
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
      // @ts-expect-error editUser is not considered as callable
      const call = usersResolver.Mutation.editUser(
        undefined,
        {
          id: THALES_USER_ID,
          input: { capabilities: [] },
        },
        testContext
      );

      await expect(call).rejects.toThrow('CANT_REMOVE_LAST_ADMINISTRATOR');
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
      const [dbUser] = await loadUnsecureUserBy({ email: DEFAULT_ADMIN_EMAIL });
      expect(dbUser).toBeDefined();
      expect(dbUser.first_name).toEqual(newFirstName);
      expect(dbUser.last_name).toEqual(newLastName);
      expect(dbUser.country).toEqual(newCountry);
      expect(dbUser.picture).toEqual(newPicture);

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
});
