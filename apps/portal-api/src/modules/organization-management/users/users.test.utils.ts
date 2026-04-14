import { expect } from 'vitest';
import { TestUserHelper } from '../../../../tests/helper/test.user.helper';
import { TEST_ORGANIZATIONS } from '../../../../tests/tests.const';
import { OrganizationId } from '../../../model/kanel/public/Organization';
import User, { UserMutator } from '../../../model/kanel/public/User';

export const insertUser = async (fields: UserMutator = {}): Promise<User> => {
  const createdUser = await TestUserHelper.user.create({
    salt: 'Fleur de sel',
    password: 'Le mot de passe',
    selected_organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
    ...fields,
  });

  expect(createdUser).toBeDefined();

  return createdUser!;
};

export const linkUsersToOrganization = async (
  users: User[],
  organizationId: OrganizationId
): Promise<void> => {
  const promises = users.map(async (user) => {
    await TestUserHelper.user_OrganizationPending.create({
      organization_id: organizationId,
      user_id: user!.id,
    });
  });

  await Promise.all(promises);
};
