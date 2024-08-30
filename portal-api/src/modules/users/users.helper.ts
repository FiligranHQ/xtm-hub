import { dbUnsecure } from '../../../knexfile';
import User, {
  UserId,
  UserInitializer,
  UserMutator,
} from '../../model/kanel/public/User';
import { addRolesToUser } from '../common/user-role-portal';
import { hashPassword } from '../../utils/hash-password.util';
import { v4 as uuidv4 } from 'uuid';
import {
  insertNewOrganization,
  loadOrganizationsFromEmail,
} from '../organizations/organizations.helper';
import {
  extractDomain,
  isAuthorizedEmail,
} from '../../utils/verify-email.util';
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

export const deleteUserUnsecure = async (field: UserMutator) => {
  return dbUnsecure<User>('User').where(field).delete('*').returning('*');
};

export const createNewUserFromInvitation = async (email: string) => {
  const { salt, hash } = hashPassword('temporaryPassword');

  if (!isAuthorizedEmail(email)) {
    // TODO: Should throw an error and break the following execution
    // throw new GraphQLError('Sorry this mail is not authorize', {
    //   extensions: { code: '[Users] NOT AUTHORIZED MAIL' },
    // });
    return null;
  }

  const [organization] = await loadOrganizationsFromEmail(email);
  if (!organization) {
    const extractedDomain = extractDomain(email);

    // TODO: Should throw an error and break the following execution
    // throw new GraphQLError('Sorry this mail is not authorize', {
    //   extensions: { code: '[Users] NOT AUTHORIZED MAIL' },
    // });
    const [newOrganization] = await insertNewOrganization({
      id: uuidv4() as OrganizationId,
      name: extractedDomain.split('.')[0],
      domains: [extractedDomain],
    });

    return await addNewUserWithRoles(
      {
        id: uuidv4() as UserId,
        email,
        salt,
        password: hash,
        organization_id: newOrganization.id,
      },
      ['ADMIN_ORGA', 'USER']
    );
  }

  return await addNewUserWithRoles(
    {
      id: uuidv4() as UserId,
      email,
      salt,
      password: hash,
      organization_id: organization.id,
    },
    ['USER']
  );
};

export const deleteUserById = async (userId: UserId) => {
  return dbUnsecure<User>('User')
    .where('id', userId)
    .delete('*')
    .returning('*');
};
