import { v4 as uuidv4 } from 'uuid';
import { afterAll, describe, expect, it } from 'vitest';
import { contextAdminUser } from '../../../tests/tests.const';
import { UserId } from '../../model/kanel/public/User';
import { ROLE_ADMIN_ORGA, ROLE_USER } from '../../portal.const';
import {
  deleteOrganizationByName,
  loadUnsecureOrganizationBy,
} from '../organizations/organizations.helper';
import {
  createUser,
  deleteUserById,
  loadUserBy,
  loadUserRoles,
} from './users.domain';
import { createNewUserFromInvitation, removeUser } from './users.helper';

describe('User helpers - createNewUserFromInvitation', async () => {
  it('should create a new user with Role USER and not add in an existing Organization', async () => {
    const testMail = `testCreateNewUserFromInvitation${uuidv4()}@filigran.io`;
    await createNewUserFromInvitation({
      email: testMail,
    });
    const newUser = await loadUserBy({ email: testMail });
    expect(newUser).toBeTruthy();
    expect(newUser.roles_portal[0].id).toBe(ROLE_USER.id);
    expect(newUser.organizations.length).toBe(1);
    expect(newUser.organizations[0].personal_space).toBe(true);

    // Delete corresponding in order to avoid issue with other tests
    await removeUser(contextAdminUser, { email: newUser.email });
  });
  it('should add new user with Role admin organization with an new Organization', async () => {
    const testMail = `testCreateNewUserFromInvitation${uuidv4()}@test-new-organization.fr`;
    await createNewUserFromInvitation({
      email: testMail,
    });
    const newUser = await loadUserBy({ email: testMail });
    expect(newUser).toBeTruthy();
    const newOrganization = await loadUnsecureOrganizationBy(
      'name',
      'test-new-organization'
    );
    const userRoles = await loadUserRoles(newUser.id as UserId);
    expect(userRoles.roles.length).toBe(2);
    expect(userRoles.roles.includes('ADMIN_ORGA')).toBeTruthy();
    expect(userRoles.roles.includes('USER')).toBeTruthy();

    expect(newOrganization).toBeTruthy();

    // Delete corresponding in order to avoid issue with other tests
    await removeUser(contextAdminUser, { email: testMail });
    await deleteOrganizationByName('test-new-organization');
  });
});

describe('User should be log with all the capacity', () => {
  let newUser;
  it('should be log with all the capacity with role ADMIN_ORGA and USER', async () => {
    newUser = await createUser({
      email: 'testCreateNewUserFromInvitation@filigran.io',
      first_name: 'test',
      roles: ['ADMIN_ORGA', 'USER'],
      last_name: 'test',
    });

    expect(newUser).toBeTruthy();
    expect(newUser.capabilities.length).toBe(7);
    expect(newUser.roles_portal.length).toBe(2);
    expect(
      newUser.roles_portal.some(({ id }) => id === ROLE_USER.id)
    ).toBeTruthy();
    expect(
      newUser.roles_portal.some(({ id }) => id === ROLE_ADMIN_ORGA.id)
    ).toBeTruthy();
  });

  afterAll(async () => {
    await deleteUserById(newUser.id as UserId);
  });
});
