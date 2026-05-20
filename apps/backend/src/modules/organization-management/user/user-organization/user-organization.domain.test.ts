import { v4 as uuidv4 } from 'uuid';
import { describe, expect, it } from 'vitest';
import { TEST_ORGANIZATIONS } from '../../../../../tests/tests.const';
import { UserOrganizationPendingDomain } from '../user-pending/user-organization-pending.domain';
import { createNewUserFromInvitation } from '../user.helper';
import { UserOrganizationDomain } from './user-organization.domain';

describe('userOrganizationDomain', () => {
  describe('createUserOrganizationRelationAndRemovePending', () => {
    it('should delete pending organization before adding an organization', async () => {
      const testMail = `createUserOrganizationRelationAndRemovePending${uuidv4()}@filigran.io`;
      const user = await createNewUserFromInvitation({
        email: testMail,
      });
      const initialPendingOrg =
        await UserOrganizationPendingDomain.loadUserOrganizationPending({
          user_id: user.id,
        });
      expect(initialPendingOrg).toHaveLength(1);

      const user_orgs =
        await UserOrganizationDomain.createUserOrganizationRelationAndRemovePending(
          {
            user_id: user.id,
            organizations_id: [TEST_ORGANIZATIONS.FILIGRAN.ID],
          }
        );

      expect(user_orgs).toHaveLength(1);
      const finalPendingOrg =
        await UserOrganizationPendingDomain.loadUserOrganizationPending({
          user_id: user.id,
        });
      expect(finalPendingOrg).toHaveLength(0);
    });

    it('should not fail if there is no organization to remove', async () => {
      const testMail = `createUserOrganizationRelationAndRemovePending${uuidv4()}@whatever.io`;
      const user = await createNewUserFromInvitation({
        email: testMail,
      });
      const initialPendingOrg =
        await UserOrganizationPendingDomain.loadUserOrganizationPending({
          user_id: user.id,
        });
      expect(initialPendingOrg).toHaveLength(0);

      const user_orgs =
        await UserOrganizationDomain.createUserOrganizationRelationAndRemovePending(
          {
            user_id: user.id,
            organizations_id: [TEST_ORGANIZATIONS.FILIGRAN.ID],
          }
        );

      expect(user_orgs).toHaveLength(1);
    });
  });
});
