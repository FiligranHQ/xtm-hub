import { toGlobalId } from 'graphql-relay/node/node.js';
import { v4 as uuidv4 } from 'uuid';
import { db, dbUnsecure } from '../../../knexfile';
import {
  Capability,
  User as GraphqlUser,
} from '../../__generated__/resolvers-types';
import Organization, {
  OrganizationId,
} from '../../model/kanel/public/Organization';
import { SubscriptionId } from '../../model/kanel/public/Subscription';
import User, {
  UserId,
  UserInitializer,
  UserMutator,
} from '../../model/kanel/public/User';
import { PortalContext } from '../../model/portal-context';
import { UserLoadUserBy, UserWithOrganizationsAndRole } from '../../model/user';
import { ROLE_ADMIN_ORGA, ROLE_USER } from '../../portal.const';
import { sendMail } from '../../server/mail-service';
import { hashPassword } from '../../utils/hash-password.util';
import { extractDomain } from '../../utils/verify-email.util';
import {
  createUserOrganizationRelationUnsecure,
  loadUserOrganization,
} from '../common/user-organization.helper';
import { addRolesToUser } from '../common/user-role-portal.helper';
import {
  insertNewOrganization,
  loadOrganizationsFromEmail,
} from '../organizations/organizations.helper';
import { loadSubscriptionBy } from '../subcription/subscription.helper';
import { loadUserBy } from './users.domain';

export const addNewUserWithRoles = async (
  data: Pick<UserInitializer, 'email' | 'first_name' | 'last_name'> & {
    password?: string;
    selected_organization_id?: OrganizationId;
  },
  roles: string[]
): Promise<User> => {
  const { salt, hash } = hashPassword(data.password ?? '');
  const uuid = uuidv4();
  // Create user personal space organization
  const [addOrganization] = await insertNewOrganization({
    id: uuid as unknown as OrganizationId,
    name: data.email,
    personal_space: true,
  });

  const [addedUser] = await dbUnsecure<User>('User')
    .insert({
      id: uuid as UserId,
      selected_organization_id:
        data.selected_organization_id ?? addOrganization.id,
      salt,
      email: data.email,
      password: hash,
    })
    .returning('*');

  // Insert relation UserOrganization
  await createUserOrganizationRelationUnsecure({
    user_id: addedUser.id,
    organizations_id: [addOrganization.id],
  });

  await addRolesToUser(addedUser.id, roles);

  await sendMail({
    to: addedUser.email,
    template: 'welcome',
    params: {},
  });

  return addedUser;
};

async function createOrganisationWithAdminUser(email: string) {
  const extractedDomain = extractDomain(email);

  const [newOrganization] = await insertNewOrganization({
    id: uuidv4() as OrganizationId,
    name: extractedDomain.split('.')[0],
    domains: [extractedDomain],
  });
  const addedUser = await addNewUserWithRoles(
    {
      email,
    },
    [ROLE_ADMIN_ORGA.name, ROLE_USER.name]
  );

  // Insert relation UserOrganization
  await createUserOrganizationRelationUnsecure({
    user_id: addedUser.id,
    organizations_id: [newOrganization.id],
  });

  return addedUser;
}

export const createNewUserFromInvitation = async ({
  email,
  first_name,
  last_name,
}: Pick<UserInitializer, 'email' | 'first_name' | 'last_name'>) => {
  const [organization] = await loadOrganizationsFromEmail(email);

  const userWithRoles: User = !organization
    ? await createOrganisationWithAdminUser(email)
    : await addNewUserWithRoles(
        {
          email,
          last_name,
          first_name,
        },
        [ROLE_USER.name]
      );

  return loadUserBy({ 'User.id': userWithRoles.id });
};

export const getOrCreateUser = async (
  userInfo: Pick<UserInitializer, 'email' | 'first_name' | 'last_name'>
) => {
  const user = await loadUserBy({ email: userInfo.email });
  return user ? user : await createNewUserFromInvitation(userInfo);
};

export const insertUserIntoOrganization = async (
  context: PortalContext,
  user: User,
  subscriptionId: SubscriptionId
) => {
  const [subscription] = await loadSubscriptionBy(
    'subscription_id',
    subscriptionId
  );
  const [organization] = await loadOrganizationsFromEmail(user.email);
  const userOrganization = await loadUserOrganization(context, {
    user_id: user.id,
    organization_id: organization.id,
  });
  if (
    userOrganization.length === 0 &&
    subscription.organization_id === organization.id
  ) {
    await createUserOrganizationRelationUnsecure({
      user_id: user.id,
      organizations_id: [organization.id],
    });
  }
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

export const removeUser = async (
  context: PortalContext,
  field: UserMutator
) => {
  const [deletedUser] = await db<User>(context, 'User')
    .delete('*')
    .where(field)
    .returning('*');

  // Organization personalSpace of the user should have the same id
  await db<Organization>(context, 'Organization')
    .delete('*')
    .where({ id: deletedUser.id as unknown as OrganizationId });

  return deletedUser;
};
