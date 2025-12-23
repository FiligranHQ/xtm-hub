import { v4 as uuidv4 } from 'uuid';
import { expect } from 'vitest';
import { db } from '../../../knexfile';
import { OrganizationId } from '../../model/kanel/public/Organization';
import User, { UserId, UserMutator } from '../../model/kanel/public/User';
import UserOrganizationPending from '../../model/kanel/public/UserOrganizationPending';
import { PLATFORM_ORGANIZATION_UUID } from '../../portal.const';

export const insertUser = async (fields: UserMutator = {}): Promise<User> => {
  const [createdUser] = await db<User>('User')
    .insert({
      id: uuidv4() as UserId,
      salt: 'Fleur de sel',
      password: 'Le mot de passe',
      selected_organization_id: PLATFORM_ORGANIZATION_UUID as OrganizationId,
      ...fields,
    })
    .returning('*');

  expect(createdUser).toBeDefined();

  return createdUser!;
};

export const linkUsersToOrganization = async (
  users: User[],
  organizationId: OrganizationId
): Promise<void> => {
  const promises = users.map(async (user) => {
    await db<UserOrganizationPending>('User_Organization_Pending').insert({
      organization_id: organizationId,
      user_id: user!.id,
    });
  });

  await Promise.all(promises);
};
