import { v4 as uuidv4 } from 'uuid';
import { describe, expect, it } from 'vitest';
import { TEST_ORGANIZATIONS } from '../../../tests/tests.const';
import { UserOrganizationPendingDomain } from '../organization-management/users/user-pending/user-organization-pending.domain';
import { createNewUserFromInvitation } from '../organization-management/users/users.helper';
import { createUserOrganizationRelationAndRemovePending } from './user-organization.helper';

describe('UserOrganizationHelper', () => {
  describe('createUserOrganizationRelationUnsecure', () => {
    it('should delete pending organization before adding an organization', async () => {
      const testMail = `createUserOrganizationRelationUnsecure${uuidv4()}@filigran.io`;
      const user = await createNewUserFromInvitation({
        email: testMail,
      });
      const initialPendingOrg =
        await UserOrganizationPendingDomain.loadUserOrganizationPending({
          user_id: user.id,
        });
      expect(initialPendingOrg.length).toBe(1);

      const user_orgs = await createUserOrganizationRelationAndRemovePending({
        user_id: user.id,
        organizations_id: [TEST_ORGANIZATIONS.FILIGRAN.ID],
      });

      expect(user_orgs.length).toBe(1);
      const finalPendingOrg =
        await UserOrganizationPendingDomain.loadUserOrganizationPending({
          user_id: user.id,
        });
      expect(finalPendingOrg.length).toBe(0);
    });

    it('should not fail if there is no organization to remove', async () => {
      const testMail = `createUserOrganizationRelationUnsecure${uuidv4()}@whatever.io`;
      const user = await createNewUserFromInvitation({
        email: testMail,
      });
      const initialPendingOrg =
        await UserOrganizationPendingDomain.loadUserOrganizationPending({
          user_id: user.id,
        });
      expect(initialPendingOrg.length).toBe(0);

      const user_orgs = await createUserOrganizationRelationAndRemovePending({
        user_id: user.id,
        organizations_id: [TEST_ORGANIZATIONS.FILIGRAN.ID],
      });

      expect(user_orgs.length).toBe(1);
    });
  });
});
