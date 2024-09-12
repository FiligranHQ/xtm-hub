import { describe, expect } from 'vitest';
import { v4 as uuidv4 } from 'uuid';
import {
  createNewUserFromInvitation,
  deleteUserById,
  loadUserRoles,
} from './users.helper';
import { ROLE_USER } from '../../portal.const';
import { loadUserBy } from './users.domain';
import { UserId } from '../../model/kanel/public/User';
import {
  deleteOrganizationByName,
  loadUnsecureOrganizationBy,
} from '../organizations/organizations.helper';

describe('User helpers - createNewUserFromInvitation', async () => {
  it('should be add new user with Role user only in an existing Organization', async () => {
    const testMail = `testCreateNewUserFromInvitation${uuidv4()}@filigran.io`;
    await createNewUserFromInvitation(testMail);
    const newUser = await loadUserBy({email: testMail});
    expect(newUser).toBeTruthy();
    expect(newUser.roles_portal_id[0].id).toBe(ROLE_USER.id);

    // Delete corresponding in order to avoid issue with other tests
    deleteUserById(newUser.id as UserId);
    const testUserDeletion = await loadUserBy({email: testMail});
    expect(testUserDeletion).toBeFalsy();
  });
  it('should not add new user with an unauthorized domain Organization', async () => {
    const testMail = `testCreateNewUserFromInvitation${uuidv4()}@gmail.com`;
    await createNewUserFromInvitation(testMail);
    const newUser = await loadUserBy({email: testMail});
    expect(newUser).toBeFalsy();
  });
  it('should be add new user with Role admin organization with an new Organization', async () => {
    const testMail = `testCreateNewUserFromInvitation${uuidv4()}@test-new-organization.fr`;
    await createNewUserFromInvitation(testMail);
    const newUser = await loadUserBy({email: testMail});
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
    deleteUserById(newUser.id as UserId);
    const testUserDeletion = await loadUserBy({email: testMail});
    expect(testUserDeletion).toBeFalsy();
    deleteOrganizationByName('test-new-organization');
  });
});
