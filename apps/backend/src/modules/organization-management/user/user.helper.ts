import { GraphQLError } from 'graphql/error/index.js';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../../../knexfile';
import {
  Capability,
  User as GraphqlUser,
  OrganizationCapability,
} from '../../../__generated__/resolvers-types';
import { withTransaction } from '../../../context/database.context';
import Organization, {
  OrganizationId,
} from '../../../model/kanel/public/Organization';
import {
  SubscriptionId,
  SubscriptionMutator,
} from '../../../model/kanel/public/Subscription';
import User, {
  UserId,
  UserInitializer,
  UserMutator,
} from '../../../model/kanel/public/User';
import {
  UserLoadUserBy,
  UserWithOrganizationsAndRole,
} from '../../../model/user';
import { dispatch } from '../../../pub';
import { sendMail } from '../../../server/mail-service';
import { updateUserSession } from '../../../session-store-manager';
import { logApp } from '../../../utils/app-logger.util';
import { ErrorCode } from '../../../utils/error/error.code';
import { hashPassword } from '../../../utils/hash-password.util';
import { isEmpty } from '../../../utils/utils';
import { extractDomain } from '../../../utils/verify-email.util';
import { createUserOrganizationCapability } from '../../security-management/user-organization-capability/user-organization-capability.domain';
import { loadSubscriptionWithOrganizationAndCapabilitiesBy } from '../../subscription/subscription.helper';
import { telemetryApp } from '../../telemetry/telemetry.app';
import { buildCreateOrganizationEvent } from '../../telemetry/telemetry.helper';
import { OrganizationDomain } from '../organization/organization.domain';
import { UserDomain } from './user-domain/user.domain';
import { UserOrganizationDomain } from './user-organization/user-organization.domain';
import { UserOrganizationPendingDomain } from './user-pending/user-organization-pending.domain';

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
  const personalSpaceOrganization =
    await OrganizationDomain.insertNewOrganization({
      id: uuid as unknown as OrganizationId,
      name: data.email,
      personal_space: true,
    });

  const [addedUser] = await db<User>('User')
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
  const [userOrgRelation] =
    await UserOrganizationDomain.createUserOrganizationRelation({
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

  const newOrganization = await OrganizationDomain.insertNewOrganization({
    id: uuidv4() as OrganizationId,
    name: extractedDomain,
    domains: [extractedDomain],
  });
  const addedUser = await createUserWithPersonalSpace({
    email,
  });

  try {
    const createOrgaEvent = buildCreateOrganizationEvent(
      newOrganization,
      addedUser.id
    );
    await telemetryApp.sendTelemetryEvent(createOrgaEvent);
  } catch (error) {
    logApp.error('Unable to send telemetry event for create organization', {
      error,
    });
  }

  // Insert relation UserOrganization
  const [userOrgRelation] =
    await UserOrganizationDomain.createUserOrganizationRelation({
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
  {
    email,
    first_name,
    last_name,
    picture,
  }: Pick<UserInitializer, 'email' | 'first_name' | 'last_name' | 'picture'>,
  organization: Organization
) => {
  const addedUser = await createUserWithPersonalSpace({
    email,
    last_name,
    first_name,
    picture,
  });
  await UserOrganizationPendingDomain.insertNewUserOrganizationPending({
    user_id: addedUser.id,
    organization_id: organization.id,
  });
  return addedUser;
};

export const createNewUserFromInvitation = async (
  {
    email,
    first_name,
    last_name,
    picture,
  }: Pick<UserInitializer, 'email' | 'first_name' | 'last_name' | 'picture'>,
  isFiligranUser: boolean = false
) => {
  const [organization] =
    await OrganizationDomain.loadOrganizationsFromEmail(email);
  let userWithRoles: User;
  if (!organization) {
    userWithRoles = await createOrganisationWithAdminUser(email);
  } else if (isFiligranUser) {
    userWithRoles = await createUserWithPersonalSpace({
      email,
      last_name,
      first_name,
      picture,
    });
  } else {
    userWithRoles = await createNewUserWithPendingOrga(
      {
        email,
        last_name,
        first_name,
        picture,
      },
      organization
    );
  }

  return UserDomain.loadUserBy({ 'User.id': userWithRoles.id });
};

export const getOrCreateUser = async (
  userInfo: Pick<
    UserInitializer,
    'email' | 'first_name' | 'last_name' | 'picture'
  >,
  upsert = false,
  isFiligranUser = false
) => {
  const user = await UserDomain.loadUserBy({ email: userInfo.email });
  if (user && upsert) {
    await db<User>('User')
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
  return user
    ? user
    : await createNewUserFromInvitation(userInfo, isFiligranUser);
};

export const insertUserIntoOrganization = async (
  user: User,
  subscriptionId: SubscriptionId
) => {
  const [subscription] =
    await loadSubscriptionWithOrganizationAndCapabilitiesBy({
      'Subscription.id': subscriptionId,
    } as SubscriptionMutator);
  const [organization] = await OrganizationDomain.loadOrganizationsFromEmail(
    user.email
  );
  const userOrganization = await UserOrganizationDomain.loadUserOrganization({
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
    const [userOrgRelation] =
      await UserOrganizationDomain.createUserOrganizationRelationAndRemovePending(
        {
          user_id: user.id,
          organizations_id: [organization.id],
        }
      );
    const shouldBeAdminOrga = await isFirstInOrganization(organization.id);
    if (shouldBeAdminOrga) {
      await createUserOrganizationCapability({
        user_organization_id: userOrgRelation.id,
        capabilities_name: [OrganizationCapability.AdministrateOrganization],
      });
    }
  }
};

export const isFirstInOrganization = async (organizationId: OrganizationId) => {
  const userOrganization = await UserOrganizationDomain.loadUserOrganization({
    organization_id: organizationId,
  });
  return userOrganization.length === 1;
};

export const mapUserToGraphqlUser = (
  user: User | UserLoadUserBy | UserWithOrganizationsAndRole
): GraphqlUser => {
  return {
    ...user,
    selected_organization_id: user.selected_organization_id,
    capabilities:
      'capabilities' in user ? (user.capabilities as Capability[]) : null,
  };
};

export const removeUser = async (field: UserMutator) => {
  const [deletedUser] = await db<User>('User')
    .where(field)
    .delete('*')
    .returning('*');

  // Organization personalSpace of the user should have the same id
  await OrganizationDomain.deleteOrganizationBy({
    id: deletedUser.id as unknown as OrganizationId,
  });

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
    throw new Error(ErrorCode.CantRemoveLastAdministrator);
  }
};

export const preventAdministratorRemovalOfAllOrganizations = async (
  userId: UserId,
  newOrganizationCapabilities: {
    organizationId: OrganizationId;
    capabilities?: string[];
  }[]
) => {
  const userOrganizations = await db('Organization')
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
  const { capabilities } = await UserDomain.loadUserCapabilitiesByOrganization(
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
  const [administratorsCount] = await db('Organization')
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

export const acceptPendingUserWithCapabilities = async ({
  user_id,
  organization_id,
  orgCapabilities,
}: {
  user_id: UserId;
  organization_id: OrganizationId;
  orgCapabilities?: string[];
}) => {
  const { user, userMapped } = await withTransaction(async () => {
    await UserOrganizationDomain.createUserOrganizationRelationAndRemovePending(
      {
        user_id,
        organizations_id: [organization_id],
      }
    );

    return await updateUserCapabilities({
      user_id,
      organization_id,
      orgCapabilities,
    });
  });

  await dispatch('User', 'edit', user);
  await dispatch('MeUser', 'edit', userMapped, 'User');
  const userPendingPayload: GraphqlUser = {
    ...userMapped,
    pending_organization_id: organization_id,
  };

  await dispatch('UserPending', 'delete', userPendingPayload, 'User');
  await dispatch('User', 'add', user);
  return user;
};

export const updateUserOrgCapabilitiesAndDispatch = async ({
  user_id,
  organization_id,
  orgCapabilities,
}: {
  user_id: UserId;
  organization_id: OrganizationId;
  orgCapabilities?: string[];
}) => {
  const { user, userMapped } = await updateUserCapabilities({
    user_id,
    organization_id,
    orgCapabilities,
  });

  await dispatch('User', 'edit', user);
  await dispatch('MeUser', 'edit', userMapped, 'User');

  return user;
};

const updateUserCapabilities = async ({
  user_id,
  organization_id,
  orgCapabilities,
}: {
  user_id: UserId;
  organization_id: OrganizationId;
  orgCapabilities?: string[];
}) => {
  const user = await withTransaction(async () => {
    await UserOrganizationDomain.updateUserOrgCapabilities({
      user_id,
      organization_id,
      orgCapabilities,
    });

    const user = await UserDomain.loadUserDetails({
      'User.id': user_id,
    });

    updateUserSession(user);
    return user;
  });
  const userMapped = mapUserToGraphqlUser(user);
  return { user, userMapped };
};

export const updateAndDispatchUser = async (userId: UserId) => {
  const user = await UserDomain.loadUserDetails({ 'User.id': userId });
  updateUserSession(user);
  const mappedUser = mapUserToGraphqlUser(user);
  await dispatch('User', 'edit', mappedUser);
  return mappedUser;
};
