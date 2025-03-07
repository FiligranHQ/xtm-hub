import { db, dbUnsecure } from '../../../knexfile';
import { OrganizationCapabilitiesInput } from '../../__generated__/resolvers-types';
import { OrganizationId } from '../../model/kanel/public/Organization';
import { UserId } from '../../model/kanel/public/User';
import UserOrganization, {
  UserOrganizationInitializer,
  UserOrganizationMutator,
} from '../../model/kanel/public/UserOrganization';
import { PortalContext } from '../../model/portal-context';
import { extractId, isEmpty } from '../../utils/utils';
import {
  createUserOrganizationCapability,
  updateUserOrganizationCapability,
} from './user-organization-capability.domain';

export const insertNewUserOrganization = (
  context: PortalContext,
  field: UserOrganizationInitializer | UserOrganizationInitializer[]
): Promise<UserOrganization[]> => {
  return db(context, 'User_Organization').insert(field).returning('*');
};

export const loadUserOrganization = (
  context: PortalContext,
  field: UserOrganizationMutator
) => {
  return db<UserOrganization>(context, 'User_Organization').where(field);
};

export const createUserOrganizationRelation = async (
  context: PortalContext,
  {
    user_id,
    organizations_id = [],
  }: {
    user_id: UserId;
    organizations_id: OrganizationId[];
  }
) => {
  const usersOrganization: UserOrganizationInitializer[] = organizations_id.map(
    (organization_id) => ({
      user_id,
      organization_id,
    })
  );
  await insertNewUserOrganization(context, usersOrganization);
};

export const createUserOrganizationRelationUnsecure = async ({
  user_id,
  organizations_id = [],
}: {
  user_id: UserId;
  organizations_id: OrganizationId[];
}): Promise<UserOrganization[]> => {
  const usersOrganization: UserOrganizationInitializer[] = organizations_id.map(
    (organization_id) => ({
      user_id,
      organization_id,
    })
  );
  return dbUnsecure<UserOrganization>('User_Organization')
    .insert(usersOrganization)
    .returning('*');
};

export const updateMultipleUserOrgWithCapabilities = async (
  context: PortalContext,
  userId: UserId,
  orgCapabilities: OrganizationCapabilitiesInput[]
) => {
  await db<UserOrganization>(context, 'User_Organization')
    .where('user_id', '=', userId)
    .whereNot('organization_id', userId) // Should not touch personal space
    .del();
  if (isEmpty(orgCapabilities)) {
    return;
  }
  for (const orgCapa of orgCapabilities) {
    const organization_id = extractId<OrganizationId>(orgCapa.organization_id);
    if (organization_id !== userId.toString()) {
      const [newUserOrganization] = await insertNewUserOrganization(context, {
        user_id: userId,
        organization_id,
      });
      await createUserOrganizationCapability({
        user_organization_id: newUserOrganization.id,
        capabilities_name: orgCapa.capabilities,
      });
    }
  }
  return true;
};

export const updateUserOrgCapabilities = async (
  context: PortalContext,
  {
    user_id,
    organization_id,
    orgCapabilities,
  }: {
    user_id: UserId;
    organization_id: OrganizationId;
    orgCapabilities: string[];
  }
) => {
  const [userOrganization] = await loadUserOrganization(context, {
    user_id,
    organization_id,
  });
  await updateUserOrganizationCapability(context, {
    user_organization_id: userOrganization.id,
    capabilities_name: orgCapabilities,
  });
  return true;
};

export const createUserOrgCapabilities = async (
  context: PortalContext,
  {
    user_id,
    organization_id,
    orgCapabilities,
  }: {
    user_id: UserId;
    organization_id: OrganizationId;
    orgCapabilities: string[];
  }
) => {
  const [userOrganization] = await insertNewUserOrganization(context, {
    user_id,
    organization_id,
  });
  await updateUserOrganizationCapability(context, {
    user_organization_id: userOrganization.id,
    capabilities_name: orgCapabilities,
  });
  return true;
};

export const removeUserFromOrganization = async (
  context: PortalContext,
  user_id: UserId,
  organization_id: OrganizationId
) => {
  return db<UserOrganization>(context, 'User_Organization')
    .where({ user_id, organization_id })
    .delete('*');
};
