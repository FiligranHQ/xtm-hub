import { toGlobalId } from 'graphql-relay/node/node';
import { v4 as uuidv4 } from 'uuid';
import { afterAll, afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  contextAdminOrgaThales,
  contextAdminUser,
  DEFAULT_ADMIN_EMAIL,
  SERVICE_VAULT_ID,
  SIMPLE_USER_FILIGRAN_ID,
  THALES_ORGA_ID,
} from '../../../tests/tests.const';
import {
  AddUserInput,
  EditUserInput,
} from '../../__generated__/resolvers-types';
import { SubscriptionId } from '../../model/kanel/public/Subscription';
import { UserId } from '../../model/kanel/public/User';
import {
  ADMIN_UUID,
  PLATFORM_ORGANIZATION_UUID,
  ROLE_USER,
} from '../../portal.const';
import {
  deleteSubscriptionUnsecure,
  insertUnsecureSubscription,
} from '../subcription/subscription.helper';
import { deleteUserById, loadUserBy } from './users.domain';
import usersResolver from './users.resolver';

const SUBSCRIPTION_ID = '7c6e887e-9553-439b-aeaf-a81911c399d2';
const RANDOM_ORGA_ID = '681fb117-e2c3-46d3-945a-0e921b5d4b6d';

describe('User query resolver', () => {
  describe('userHasOrganizationWithSubscription', () => {
    beforeEach(async () => {
      await insertUnsecureSubscription({
        id: SUBSCRIPTION_ID,
        organization_id: THALES_ORGA_ID,
        service_id: SERVICE_VAULT_ID,
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
});

describe('Query resolver', () => {
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
      { email: DEFAULT_ADMIN_EMAIL, password: 'admin' },
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

  describe('AddUser Mutation', () => {
    it('should not create an existing user', async () => {
      try {
        // @ts-ignore
        await usersResolver.Mutation.addUser(
          undefined,
          {
            input: {
              email: DEFAULT_ADMIN_EMAIL,
              password: 'admin',
              roles_id: [toGlobalId('RolePortal', ROLE_USER.id)],
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

    describe('should create user with personal space', async () => {
      const testMail = `testAddUser${uuidv4()}@test.fr`;
      // @ts-ignore
      const response = await usersResolver.Mutation.addUser(
        undefined,
        {
          input: {
            email: testMail,
            password: 'admin',
            roles_id: [toGlobalId('RolePortal', ROLE_USER.id)],
            organizations: [],
          } as AddUserInput,
        },
        contextAdminUser
      );
      expect(response).toBeTruthy();
      const user = await loadUserBy({ 'User.id': response.id });

      it('should have only one organization Personal space', async () => {
        expect(user.organizations.length).toEqual(1);
      });

      it('should User.Id is equal to Organization.Id', async () => {
        expect(user.id).toEqual(user.organizations[0].id);
      });
    });

    describe('as Admin - should create user with personal space and add to internal organization', async () => {
      const testMail = `testAddUser${uuidv4()}@test.fr`;
      // @ts-ignore
      const response = await usersResolver.Mutation.addUser(
        undefined,
        {
          input: {
            email: testMail,
            password: 'admin',
            roles_id: [toGlobalId('RolePortal', ROLE_USER.id)],
            organizations: [
              toGlobalId('Organization', PLATFORM_ORGANIZATION_UUID),
            ],
          } as AddUserInput,
        },
        contextAdminUser
      );
      expect(response).toBeTruthy();
      const user = await loadUserBy({ 'User.id': response.id });
      it('should have Personal space and Internal as organization', async () => {
        expect(
          user.organizations.some(
            (org) => org.id === PLATFORM_ORGANIZATION_UUID
          )
        ).toBeTruthy();
        expect(
          user.organizations.some(
            (org) => org.id.toString() === user.id.toString()
          )
        ).toBeTruthy();
      });

      expect(user.organizations.length).toEqual(2);

      afterAll(async () => {
        await deleteUserById(response.id as UserId);
      });
    });

    it('as Admin Organization - should not able to create user with different email domain', async () => {
      const testMail = `testAddUser${uuidv4()}@test.fr`;
      try {
        // @ts-ignore
        await usersResolver.Mutation.addUser(
          undefined,
          {
            input: {
              email: testMail,
              password: 'admin',
              roles_id: [toGlobalId('RolePortal', ROLE_USER.id)],
              organizations: [toGlobalId('Organization', THALES_ORGA_ID)],
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
  });

  describe('as Admin orga - should create user with personal space and add to Thales organization', async () => {
    const testMail = `testAddUser${uuidv4()}@thales.com`;
    // @ts-ignore
    const response = await usersResolver.Mutation.addUser(
      undefined,
      {
        input: {
          email: testMail,
          password: 'admin',
          roles_id: [toGlobalId('RolePortal', ROLE_USER.id)],
          organizations: [toGlobalId('Organization', THALES_ORGA_ID)],
        } as AddUserInput,
      },
      contextAdminOrgaThales
    );
    const user = await loadUserBy({ 'User.id': response.id });
    it('should have Personal space and Thales as organization', async () => {
      expect(response).toBeTruthy();
      expect(
        user.organizations.some((org) => org.id === THALES_ORGA_ID)
      ).toBeTruthy();
      expect(
        user.organizations.some(
          (org) => org.id.toString() === user.id.toString()
        )
      ).toBeTruthy();
    });

    expect(user.organizations.length).toEqual(2);

    afterAll(async () => {
      await deleteUserById(response.id as UserId);
    });
  });

  describe('EditUser Mutation', () => {
    describe('should edit an existing user', async () => {
      const fallbackUser = await loadUserBy({ email: 'user15@test.fr' });
      // @ts-ignore
      const response = await usersResolver.Mutation.editUser(
        undefined,
        {
          id: SIMPLE_USER_FILIGRAN_ID,
          input: {
            organizations: [
              toGlobalId('Organization', SIMPLE_USER_FILIGRAN_ID),
              toGlobalId('Organization', PLATFORM_ORGANIZATION_UUID),
              toGlobalId('Organization', THALES_ORGA_ID),
            ],
          } as EditUserInput,
        },
        contextAdminUser
      );

      expect(response).toBeTruthy();
      it('should have update organisations, first_name and last_name', async () => {
        expect(response.organizations.length).toEqual(3);
      });
      it('should not have update other fields', async () => {
        expect(fallbackUser.roles_portal.length).toEqual(
          response.roles_portal.length
        );
        expect(fallbackUser.email).toEqual(response.email);
      });

      afterAll(async () => {
        // @ts-ignore
        await usersResolver.Mutation.editUser(
          undefined,
          {
            id: SIMPLE_USER_FILIGRAN_ID,
            input: {
              organizations: [
                toGlobalId('Organization', SIMPLE_USER_FILIGRAN_ID),
                toGlobalId('Organization', PLATFORM_ORGANIZATION_UUID),
              ],
            } as EditUserInput,
          },
          contextAdminUser
        );
      });
    });

    it('user should not be able to edit himself', async () => {
      try {
        // @ts-ignore
        await usersResolver.Mutation.editUser(
          undefined,
          {
            id: ADMIN_UUID,
            input: {
              organizations: [
                toGlobalId('Organization', ADMIN_UUID),
                toGlobalId('Organization', PLATFORM_ORGANIZATION_UUID),
                toGlobalId('Organization', THALES_ORGA_ID),
              ],
            } as EditUserInput,
          },
          contextAdminUser
        );
      } catch (error) {
        expect(error).toBeTruthy();
        expect(error.message).toEqual('CANT_EDIT_YOURSELF_ERROR');
      }
    });
  });
});
