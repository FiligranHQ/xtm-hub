import { toGlobalId } from 'graphql-relay/node/node.js';
import { GraphQLError } from 'graphql/error/index.js';
import { v4 as uuidv4 } from 'uuid';
import { db, dbUnsecure } from '../../../knexfile';
import {
  Capability,
  User as GraphqlUser,
  OrganizationCapability,
} from '../../__generated__/resolvers-types';
import Organization, {
  OrganizationId,
} from '../../model/kanel/public/Organization';
import {
  SubscriptionId,
  SubscriptionMutator,
} from '../../model/kanel/public/Subscription';
import User, {
  UserId,
  UserInitializer,
  UserMutator,
} from '../../model/kanel/public/User';
import { PortalContext } from '../../model/portal-context';
import { UserLoadUserBy, UserWithOrganizationsAndRole } from '../../model/user';
import { sendMail } from '../../server/mail-service';
import { logApp } from '../../utils/app-logger.util';
import { hashPassword } from '../../utils/hash-password.util';
import { isEmpty } from '../../utils/utils';
import { extractDomain } from '../../utils/verify-email.util';
import { createUserOrganizationCapability } from '../common/user-organization-capability.domain';
import { loadUserOrganization } from '../common/user-organization.domain';
import {
  createUserOrganizationRelation,
  createUserOrganizationRelationAndRemovePending,
} from '../common/user-organization.helper';
import {
  insertNewOrganization,
  loadOrganizationsFromEmail,
} from '../organizations/organizations.helper';
import { loadSubscriptionWithOrganizationAndCapabilitiesBy } from '../subcription/subscription.helper';
import { loadUserBy, loadUserCapabilitiesByOrganization } from './users.domain';
import { insertNewUserOrganizationPendingUnsecure } from '../common/user-organization-pending.domain';

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
  const [personalSpaceOrganization] = await insertNewOrganization({
    id: uuid as unknown as OrganizationId,
    name: data.email,
    personal_space: true,
  });

  const [addedUser] = await dbUnsecure<User>('User')
    .insert({
      id: uuid as UserId,
      selected_organization_id:
        data.selected_organization_id ?? personalSpaceOrganization.id,
      salt,
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      picture: data.picture,
      password: hash,
    })
    .returning('*');

  // Insert relation UserOrganization
  const [userOrgRelation] = await createUserOrganizationRelation({
    user_id: addedUser.id,
    organizations_id: [personalSpaceOrganization.id],
  });

  await createUserOrganizationCapability({
    user_organization_id: userOrgRelation.id,
    capabilities_name: [OrganizationCapability.AdministrateOrganization],
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
  const [userOrgRelation] = await createUserOrganizationRelation({
    user_id: addedUser.id,
    organizations_id: [newOrganization.id],
  });

  await createUserOrganizationCapability({
    user_organization_id: userOrgRelation.id,
    capabilities_name: [OrganizationCapability.AdministrateOrganization],
  });

  return addedUser;
}

export const createNewUserWithPendingOrga = async (
  { email, first_name, last_name, picture } : Pick<UserInitializer, 'email' | 'first_name' | 'last_name' | 'picture'>,
  organization: Organization ) => {
  const addedUser = await createUserWithPersonalSpace({
    email,
    last_name,
    first_name,
    picture,
  });
  await insertNewUserOrganizationPendingUnsecure({
    user_id: addedUser.id,
    organization_id: organization.id,
  });
  return addedUser;
};


export const createNewUserFromInvitation = async ({
  email,
  first_name,
  last_name,
  picture,
}: Pick<UserInitializer, 'email' | 'first_name' | 'last_name' | 'picture'>) => {
  const [organization] = await loadOrganizationsFromEmail(email);
  const userWithRoles: User = !organization
    ? await createOrganisationWithAdminUser(email)
    : await createNewUserWithPendingOrga({
        email,
        last_name,
        first_name,
        picture,
      },
      organization);

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
  const [subscription] =
    await loadSubscriptionWithOrganizationAndCapabilitiesBy(context, {
      'Subscription.id': subscriptionId,
    } as SubscriptionMutator);
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
    const [userOrgRelation] = await createUserOrganizationRelationAndRemovePending(
      context,
      {
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
        capabilities_name: [OrganizationCapability.AdministrateOrganization],
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

export const hasAdministrateOrganizationCapability = (
  capabilities?: string[]
): boolean => {
  return (capabilities ?? []).includes(
    OrganizationCapability.AdministrateOrganization
  );
};

export const preventAdministratorRemovalOfOneOrganization = async (
  userId: UserId,
  organizationId: OrganizationId,
  capabilities?: string[]
) => {
  const isRemovingAdministratorCapability =
    !hasAdministrateOrganizationCapability(capabilities);

  if (!isRemovingAdministratorCapability) {
    return;
  }

  const isLastWithCapability = await isUserLastOrganizationAdministrator(
    userId,
    organizationId
  );

  if (isLastWithCapability) {
    throw new Error('CANT_REMOVE_LAST_ADMINISTRATOR');
  }
};

export const preventAdministratorRemovalOfAllOrganizations = async (
  context: PortalContext,
  userId: UserId,
  newOrganizationCapabilities: {
    organizationId: OrganizationId;
    capabilities?: string[];
  }[]
) => {
  const userOrganizations = await db(context, 'Organization')
    .select('Organization.id')
    .leftJoin(
      'User_Organization',
      'User_Organization.organization_id',
      'Organization.id'
    )
    .leftJoin('User', 'User.id', 'User_Organization.user_id')
    .where('User.id', '=', userId)
    .andWhereNot('Organization.personal_space', '=', true);

  for (const organization of userOrganizations) {
    const organizationCapabilities = (newOrganizationCapabilities ?? []).find(
      (newCapabilities) => newCapabilities.organizationId === organization.id
    );

    await preventAdministratorRemovalOfOneOrganization(
      userId,
      organization.id,
      organizationCapabilities?.capabilities
    );
  }
};

const isUserLastOrganizationAdministrator = async (
  userId: UserId,
  organizationId: OrganizationId
) => {
  const { capabilities } = await loadUserCapabilitiesByOrganization(
    userId,
    organizationId
  );
  if (!hasAdministrateOrganizationCapability(capabilities)) {
    return false;
  }

  const administratorsCount =
    await countOrganizationAdministrators(organizationId);

  if (administratorsCount === 0) {
    logApp.error(
      `Zero administrators found in the organization ${organizationId}`
    );
  }

  return administratorsCount <= 1;
};

const countOrganizationAdministrators = async (
  organizationId: OrganizationId
): Promise<number> => {
  const [administratorsCount] = await dbUnsecure('Organization')
    .count('Organization.id')
    .leftJoin(
      'User_Organization',
      'User_Organization.organization_id',
      'Organization.id'
    )
    .leftJoin(
      'UserOrganization_Capability',
      'UserOrganization_Capability.user_organization_id',
      'User_Organization.id'
    )
    .where('Organization.id', '=', organizationId)
    .andWhere(
      'UserOrganization_Capability.name',
      '=',
      OrganizationCapability.AdministrateOrganization
    )
    .groupBy('Organization.id');

  return administratorsCount?.count ?? 0;
};
