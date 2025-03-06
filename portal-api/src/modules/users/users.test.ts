import { v4 as uuidv4 } from 'uuid';
import { describe, expect, it } from 'vitest';
import { contextAdminUser } from '../../../tests/tests.const';
import { UserId } from '../../model/kanel/public/User';
import {
  deleteOrganizationByName,
  loadUnsecureOrganizationBy,
} from '../organizations/organizations.helper';
import { loadUserBy, loadUserCapacityByOrganization } from './users.domain';
import { createNewUserFromInvitation, removeUser } from './users.helper';

describe('User helpers - createNewUserFromInvitation', async () => {
  it('should create a new user with Role USER and not add in an existing Organization', async () => {
    const testMail = `testCreateNewUserFromInvitation${uuidv4()}@filigran.io`;
    await createNewUserFromInvitation({
      email: testMail,
    });
    const newUser = await loadUserBy({ email: testMail });
    expect(newUser).toBeTruthy();
    expect(newUser.selected_org_capabilities.length).toBe(1);
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
    const userOrgCapa = await loadUserCapacityByOrganization(
      newUser.id as UserId,
      newOrganization.id
    );
    expect(userOrgCapa.capabilities.length).toBe(2);
    expect(userOrgCapa.capabilities.includes('MANAGE_ACCESS')).toBeTruthy();
    expect(
      userOrgCapa.capabilities.includes('MANAGE_SUBSCRIPTION')
    ).toBeTruthy();

    expect(newOrganization).toBeTruthy();

    // Delete corresponding in order to avoid issue with other tests
    await removeUser(contextAdminUser, { email: testMail });
    await deleteOrganizationByName('test-new-organization');
  });
});
