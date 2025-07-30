import { afterEach, describe, expect, it } from 'vitest';
import { contextAdminUser } from '../../../tests/tests.const';
import { PLATFORM_ORGANIZATION_UUID } from '../../portal.const';
import { createUserOrganizationRelationAndRemovePending } from './user-organization.helper';
import { v4 as uuidv4 } from 'uuid';
import { createNewUserFromInvitation, removeUser } from '../users/users.helper';
import { loadUserOrganizationPending } from './user-organization-pending.domain';
import { UserLoadUserBy } from '../../model/user';


let user:UserLoadUserBy | null;

describe('UserOrganizationHelper', () => {
  describe('createUserOrganizationRelationUnsecure', () => {
    afterEach(async () => {
      if (user) {
        await removeUser(contextAdminUser, { email: user.email });
        user = null;
      }
    });
    it('should delete pending organization before adding an organization', async () => {
      const testMail = `createUserOrganizationRelationUnsecure${uuidv4()}@filigran.io`;
      user = await createNewUserFromInvitation({
        email: testMail,
      });
      const initialPendingOrg = await loadUserOrganizationPending(contextAdminUser, {user_id: user.id});
      expect(initialPendingOrg.length).toBe(1);


      const user_orgs = await createUserOrganizationRelationAndRemovePending(
        contextAdminUser,
        {user_id: user.id, organizations_id: [PLATFORM_ORGANIZATION_UUID] }
      );


      expect(user_orgs.length).toBe(1);
      const finalPendingOrg = await loadUserOrganizationPending(contextAdminUser, {user_id: user.id});
      expect(finalPendingOrg.length).toBe(0);
    });

    it('should not fail if there is no organization to remove', async () => {
      const testMail = `createUserOrganizationRelationUnsecure${uuidv4()}@whatever.io`;
      const user = await createNewUserFromInvitation({
        email: testMail,
      });
      const initialPendingOrg = await loadUserOrganizationPending(contextAdminUser,{user_id: user.id});
      expect(initialPendingOrg.length).toBe(0);

      const user_orgs = await createUserOrganizationRelationAndRemovePending(
        contextAdminUser,
        {user_id: user.id, organizations_id: [PLATFORM_ORGANIZATION_UUID]}
      );

      expect(user_orgs.length).toBe(1);
    });
  });
});