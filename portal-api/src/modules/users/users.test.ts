import { describe } from 'vitest';
import { v4 as uuidv4 } from 'uuid';
import { createNewUserFromInvitation, deleteUserById } from './users.helper';
import { ROLE_USER } from '../../portal.const';
import { loadUserBy } from './users.domain';
import { UserId } from '../../model/kanel/public/User';

describe('User helpers - createNewUserFromInvitation', async () => {
  it('should be add new user with Role user only in an existing Organization', async () => {
    const testMail = `testCreateNewUserFromInvitation${uuidv4()}@filigran.io`;
    await createNewUserFromInvitation(testMail);
    const newUser = await loadUserBy('User.email', testMail);
    expect(newUser).toBeTruthy();
    expect(newUser.roles_portal_id[0].id).toBe(ROLE_USER.id);

    // Delete corresponding in order to avoid issue with other tests
    deleteUserById(newUser.id as UserId);
    const testUserDeletion = await loadUserBy('User.email', testMail);
    expect(testUserDeletion).toBeFalsy();
  });
  it('should not add new user with an unknown domain Organization', async () => {
    const testMail = `testCreateNewUserFromInvitation${uuidv4()}@gmail.com`;
    await createNewUserFromInvitation(testMail);
    const newUser = await loadUserBy('User.email', testMail);
    expect(newUser).toBeFalsy();
  });
  // it('should be add new user with Role admin organization with an new Organization', async () => {
  //   const testMail = `testCreateNewUserFromInvitation${uuidv4()}@test-new-organization.fr`;
  //   await createNewUserFromInvitation(testMail);
  //   const newUser = await loadUserBy('User.email', testMail);
  //   expect(newUser).toBeTruthy();
  //   expect(newUser.roles_portal_id[0].id).toBe(ROLE_USER.id);
  //
  //   // Delete corresponding in order to avoid issue with other tests
  //   deleteUserById(newUser.id as UserId);
  //   const testUserDeletion = await loadUserBy('User.email', testMail);
  //   expect(testUserDeletion).toBeFalsy();
  // });
});
