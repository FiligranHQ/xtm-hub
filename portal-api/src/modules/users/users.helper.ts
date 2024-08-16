import { dbUnsecure } from '../../../knexfile';
import User, { UserId, UserInitializer } from '../../model/kanel/public/User';
import { addRolesToUser } from '../common/user-role-portal';
import { hashPassword } from '../../utils/hash-password.util';
import { v4 as uuidv4 } from 'uuid';
import { OrganizationId } from '../../model/kanel/public/Organization';

export const addNewUserWithRoles = async (
  data: UserInitializer,
  roles: string[]
) => {
  const [addedUser] = await dbUnsecure<User>('User')
    .insert(data)
    .returning('*');
  await addRolesToUser(data.id, roles);
  return addedUser;
};

export const createNewUserFromInvitation = async (
  email: string,
  organization_id: OrganizationId
) => {
  const { salt, hash } = hashPassword('temporaryPassword');
  return await addNewUserWithRoles(
    {
      id: uuidv4() as UserId,
      email,
      salt,
      password: hash,
      organization_id,
    },
    ['USER']
  );
};
