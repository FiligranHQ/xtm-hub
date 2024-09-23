import { db, dbRaw, dbUnsecure } from '../../../knexfile';
import User, {
  UserId,
  UserInitializer,
  UserMutator,
} from '../../model/kanel/public/User';
import {
  addRolesToUser,
  createUserRolePortal,
  deleteUserRolePortalByUserId,
} from '../common/user-role-portal';
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
import { loadUserBy } from './users.domain';
import { launchAWXWorkflow } from '../../managers/awx/awx-configuration';
import { AWXAction } from '../../managers/awx/awx.model';
import { ROLE_ADMIN, ROLE_USER } from '../../portal.const';
import { RolePortalId } from '../../model/kanel/public/RolePortal';
import { loadOrganizationBy } from '../organizations/organizations.domain';
import { PortalContext } from '../../model/portal-context';
import { extractId } from '../../utils/utils';
import { EditUserInput } from '../../__generated__/resolvers-types';

export const addNewUserWithRoles = async (
  data: UserInitializer,
  roles: string[]
): Promise<User> => {
  const [addedUser] = await dbUnsecure<User>('User')
    .insert(data)
    .returning('*');

  await addRolesToUser(data.id, roles);
  return addedUser;
};

export const deleteUserUnsecure = async (field: UserMutator) => {
  return dbUnsecure<User>('User').where(field).delete('*').returning('*');
};

async function createOrganisationWithAdminUser(
  email: string,
  salt: string,
  hash: string
) {
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
    [ROLE_ADMIN.id, ROLE_USER.name]
  );
}

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

  const userWithRoles: User = !organization
    ? await createOrganisationWithAdminUser(email, salt, hash)
    : await addNewUserWithRoles(
        {
          id: uuidv4() as UserId,
          email,
          salt,
          password: hash,
          organization_id: organization.id,
        },
        [ROLE_USER.name]
      );

  await launchAWXWorkflow({
    type: AWXAction.CREATE_USER,
    input: {
      ...userWithRoles,
      salt,
      password: 'temporaryPassword',
      roles: !organization ? [ROLE_ADMIN.id, ROLE_USER.id] : [ROLE_USER.id],
    },
  });

  return userWithRoles;
};

export const deleteUserById = async (userId: UserId) => {
  return dbUnsecure<User>('User')
    .where('id', userId)
    .delete('*')
    .returning('*');
};

export const getOrCreateUser = async (email: string) => {
  const user = await loadUserBy({ email });
  return user ? user : await createNewUserFromInvitation(email);
};

export const loadUserRoles = async (userId: UserId) => {
  return dbUnsecure('User')
    .leftJoin('User_RolePortal', 'User.id', 'User_RolePortal.user_id')
    .leftJoin('RolePortal', 'User_RolePortal.role_portal_id', 'RolePortal.id')
    .where('User.id', userId)
    .select([
      'User.*', // Select all columns from the User table
      dbRaw('json_agg("RolePortal".name) as roles'), // Aggregate role names into an array
    ])
    .groupBy('User.id') // Group by User.id to ensure proper aggregation
    .first();
};

export const updateUser = async (
  context: PortalContext,
  id: string,
  input: EditUserInput
) => {
  const organization_id = extractId(input.organization_id);
  const { roles_id, ...inputWithoutRoles } = input;
  const rolePortalIds = roles_id.map(extractId);
  const update = { ...inputWithoutRoles, organization_id } as User;
  const [updatedUser] = await db<User>(context, 'User')
    .where({ id: id as UserId })
    .update(update)
    .returning('*');

  await deleteUserRolePortalByUserId(updatedUser.id);

  const roles_portal_id = await Promise.all(
    rolePortalIds.map(async (rolePortalId) => {
      await createUserRolePortal(
        updatedUser.id as UserId,
        rolePortalId as RolePortalId
      );
      return { id: rolePortalId };
    })
  );
  const organization = await loadOrganizationBy(
    context,
    'Organization.id',
    organization_id
  );

  return {
    ...updatedUser,
    organization,
    roles_portal_id,
  };
};
