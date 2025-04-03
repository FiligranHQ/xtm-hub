import { toGlobalId } from 'graphql-relay/node/node.js';
import { GraphQLError } from 'graphql/error/index.js';
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
import { sendMail } from '../../server/mail-service';
import { hashPassword } from '../../utils/hash-password.util';
import { isEmpty } from '../../utils/utils';
import { extractDomain } from '../../utils/verify-email.util';
import { createUserOrganizationCapability } from '../common/user-organization-capability.domain';
import {
  createUserOrganizationRelationUnsecure,
  loadUserOrganization,
} from '../common/user-organization.domain';
import {
  insertNewOrganization,
  loadOrganizationsFromEmail,
} from '../organizations/organizations.helper';
import { loadSubscriptionBy } from '../subcription/subscription.helper';
import { loadUserBy } from './users.domain';

export const createUserWithPersonalSpace = async (
  data: Pick<
    UserInitializer,
    'email' | 'first_name' | 'last_name' | 'picture'
  > & {
    password?: string;
    selected_organization_id?: OrganizationId;
  }
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
      first_name: data.first_name,
      last_name: data.last_name,
      picture: data.picture,
      password: hash,
    })
    .returning('*');

  // Insert relation UserOrganization
  const [userOrgRelation] = await createUserOrganizationRelationUnsecure({
    user_id: addedUser.id,
    organizations_id: [addOrganization.id],
  });

  await createUserOrganizationCapability({
    user_organization_id: userOrgRelation.id,
    capabilities_name: ['MANAGE_SUBSCRIPTION'],
  });

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
  const addedUser = await createUserWithPersonalSpace({
    email,
  });

  // Insert relation UserOrganization
  const [userOrgRelation] = await createUserOrganizationRelationUnsecure({
    user_id: addedUser.id,
    organizations_id: [newOrganization.id],
  });

  await createUserOrganizationCapability({
    user_organization_id: userOrgRelation.id,
    capabilities_name: ['MANAGE_ACCESS', 'MANAGE_SUBSCRIPTION'],
  });

  return addedUser;
}

export const createNewUserFromInvitation = async ({
  email,
  first_name,
  last_name,
  picture,
}: Pick<UserInitializer, 'email' | 'first_name' | 'last_name' | 'picture'>) => {
  const [organization] = await loadOrganizationsFromEmail(email);

  const userWithRoles: User = !organization
    ? await createOrganisationWithAdminUser(email)
    : await createUserWithPersonalSpace({
        email,
        last_name,
        first_name,
        picture,
      });

  return loadUserBy({ 'User.id': userWithRoles.id });
};

export const getOrCreateUser = async (
  userInfo: Pick<
    UserInitializer,
    'email' | 'first_name' | 'last_name' | 'picture'
  >,
  upsert = false
) => {
  const user = await loadUserBy({ email: userInfo.email });
  if (user && upsert) {
    await dbUnsecure<User>('User')
      .where({ id: user.id })
      .update({
        last_login: new Date(),
        first_name: isEmpty(user.first_name)
          ? userInfo.first_name
          : user.first_name,
        last_name: isEmpty(user.last_name)
          ? userInfo.last_name
          : user.last_name,
        picture: isEmpty(user.picture) ? userInfo.picture : user.picture,
      });
  }
  return user ? user : await createNewUserFromInvitation(userInfo);
};

export const insertUserIntoOrganization = async (
  context: PortalContext,
  user: User,
  subscriptionId: SubscriptionId
) => {
  const [subscription] = await loadSubscriptionBy({ id: subscriptionId });
  const [organization] = await loadOrganizationsFromEmail(user.email);
  const userOrganization = await loadUserOrganization(context, {
    user_id: user.id,
    organization_id: organization.id,
  });
  if (subscription.organization_id !== organization.id) {
    throw new GraphQLError(
      'The email address does not correspond to the current organization',
      {
        extensions: { code: '[User_Service] EMAIL ADDRESS WRONG DOMAIN' },
      }
    );
  }
  if (isEmpty(userOrganization)) {
    const [userOrgRelation] = await createUserOrganizationRelationUnsecure({
      user_id: user.id,
      organizations_id: [organization.id],
    });
    const shouldBeAdminOrga = await isFirstInOrganization(
      context,
      organization.id
    );
    if (shouldBeAdminOrga) {
      await createUserOrganizationCapability({
        user_organization_id: userOrgRelation.id,
        capabilities_name: ['MANAGE_ACCESS', 'MANAGE_SUBSCRIPTION'],
      });
    }
  }
};

export const isFirstInOrganization = async (
  context: PortalContext,
  organizationId: OrganizationId
) => {
  const userOrganization = await loadUserOrganization(context, {
    organization_id: organizationId,
  });
  return userOrganization.length === 1;
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
    .where(field)
    .delete('*')
    .returning('*');

  // Organization personalSpace of the user should have the same id
  await db<Organization>(context, 'Organization')
    .delete('*')
    .where({ id: deletedUser.id as unknown as OrganizationId });

  return deletedUser;
};
