import { toGlobalId } from 'graphql-relay/node/node';
import { v4 as uuidv4 } from 'uuid';
import { afterAll, describe, expect, it } from 'vitest';
import { contextAdminUser } from '../../../tests/tests.const';
import {
  AddUserInput,
  EditUserInput,
} from '../../__generated__/resolvers-types';
import { UserId } from '../../model/kanel/public/User';
import {
  ADMIN_UUID,
  PLATFORM_ORGANIZATION_UUID,
  ROLE_USER,
} from '../../portal.const';
import { deleteUserById, loadUserBy } from './users.domain';
import usersResolver from './users.resolver';

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
      { email: 'admin@filigran.io', password: 'admin' },
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
              email: 'admin@filigran.io',
              password: 'admin',
              roles_id: [toGlobalId('RolePörtal', ROLE_USER.id)],
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
            roles_id: [toGlobalId('RolePörtal', ROLE_USER.id)],
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

    describe('should create user with personal space and add to internal organization', async () => {
      const testMail = `testAddUser${uuidv4()}@test.fr`;
      // @ts-ignore
      const response = await usersResolver.Mutation.addUser(
        undefined,
        {
          input: {
            email: testMail,
            password: 'admin',
            roles_id: [toGlobalId('RolePörtal', ROLE_USER.id)],
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
  });

  describe('EditUser Mutation', () => {
    describe('should edit an existing user', async () => {
      const fallbackUser = await loadUserBy({ email: 'admin@filigran.io' });
      // @ts-ignore
      const response = await usersResolver.Mutation.editUser(
        undefined,
        {
          id: ADMIN_UUID,
          input: {
            first_name: 'test_firstname',
            last_name: 'admin_lastname',
            organizations: [
              toGlobalId('Organization', ADMIN_UUID),
              toGlobalId('Organization', PLATFORM_ORGANIZATION_UUID),
              toGlobalId(
                'Organization',
                '681fb117-e2c3-46d3-945a-0e921b5d4b6c'
              ),
            ],
          } as EditUserInput,
        },
        contextAdminUser
      );

      expect(response).toBeTruthy();
      it('should have update organisations, first_name and last_name', async () => {
        expect(response.first_name).toEqual('test_firstname');
        expect(response.last_name).toEqual('admin_lastname');
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
            id: ADMIN_UUID,
            input: {
              first_name: null,
              last_name: null,
              organizations: [
                toGlobalId('Organization', ADMIN_UUID),
                toGlobalId('Organization', PLATFORM_ORGANIZATION_UUID),
              ],
            } as EditUserInput,
          },
          contextAdminUser
        );
      });
    });
  });
});
