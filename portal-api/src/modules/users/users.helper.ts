import { toGlobalId } from 'graphql-relay/node/node.js';
import { v4 as uuidv4 } from 'uuid';
import { dbUnsecure } from '../../../knexfile';
import {
  Capability,
  User as GraphqlUser,
} from '../../__generated__/resolvers-types';
import { OrganizationId } from '../../model/kanel/public/Organization';
import User, { UserId, UserInitializer } from '../../model/kanel/public/User';
import { UserLoadUserBy, UserWithOrganizationsAndRole } from '../../model/user';
import { ROLE_ADMIN_ORGA, ROLE_USER } from '../../portal.const';
import { hashPassword } from '../../utils/hash-password.util';
import {
  extractDomain,
  isAuthorizedEmail,
} from '../../utils/verify-email.util';
import { addRolesToUser } from '../common/user-role-portal.helper';
import {
  insertNewOrganization,
  loadOrganizationsFromEmail,
} from '../organizations/organizations.helper';
import { loadUserBy } from './users.domain';

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
  // TODO: Issue 10 - Chunk 2, verify if this is the right way to do it
  return await addNewUserWithRoles(
    {
      id: uuidv4() as UserId,
      email,
      salt,
      password: hash,
      selected_organization_id: newOrganization.id,
    },
    [ROLE_ADMIN_ORGA.name, ROLE_USER.name]
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
          selected_organization_id: organization.id,
        },
        [ROLE_USER.name]
      );

  return userWithRoles;
};

export const getOrCreateUser = async (email: string) => {
  const user = await loadUserBy({ email });
  return user ? user : await createNewUserFromInvitation(email);
};

export const mapUserToGraphqlUser = (
  user: User | UserLoadUserBy | UserWithOrganizationsAndRole
): GraphqlUser => {
  return {
    ...user,
    selected_organization_id: toGlobalId(
      'Organization',
      user.selected_organization_id
    ),
    capabilities:
      'capabilities' in user ? (user.capabilities as Capability[]) : null,
  };
};
