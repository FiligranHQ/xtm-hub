import { db } from '../../../knexfile';
import { OrganizationCapabilitiesInput } from '../../__generated__/resolvers-types';
import { requestContext } from '../../context/request.context';
import Organization, {
  OrganizationId,
} from '../../model/kanel/public/Organization';
import User, { UserId } from '../../model/kanel/public/User';
import UserOrganization, {
  UserOrganizationInitializer,
  UserOrganizationMutator,
} from '../../model/kanel/public/UserOrganization';
import { sendMail } from '../../server/mail-service';
import { extractId, isEmpty } from '../../utils/utils';
import {
  createUserOrganizationCapability,
  updateUserOrganizationCapability,
} from './user-organization-capability.domain';

export const insertNewUserOrganization = (
  field: UserOrganizationInitializer | UserOrganizationInitializer[]
): Promise<UserOrganization[]> => {
  return db('User_Organization').insert(field).returning('*');
};

export const loadUserOrganization = (
  field: UserOrganizationMutator
): Promise<UserOrganization[]> => {
  return db<UserOrganization>('User_Organization').where(field);
};

export const updateMultipleUserOrgWithCapabilities = async (
  userId: UserId,
  orgCapabilities?: OrganizationCapabilitiesInput[]
) => {
  await db<UserOrganization>('User_Organization')
    .where('user_id', '=', userId)
    .whereNot('organization_id', userId) // Should not touch personal space
    .del();
  if (isEmpty(orgCapabilities)) {
    return;
  }
  for (const orgCapa of orgCapabilities) {
    const organization_id = extractId<OrganizationId>(orgCapa.organization_id);
    if (organization_id !== userId.toString()) {
      const [newUserOrganization] = await insertNewUserOrganization({
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

export const updateUserOrgCapabilities = async ({
  user_id,
  organization_id,
  orgCapabilities,
}: {
  user_id: UserId;
  organization_id: OrganizationId;
  orgCapabilities?: string[];
}) => {
  const [userOrganization] = await loadUserOrganization({
    user_id,
    organization_id,
  });
  await updateUserOrganizationCapability({
    user_organization_id: userOrganization.id,
    capabilities_name: orgCapabilities,
  });
  return true;
};

export const createUserOrgCapabilities = async ({
  user,
  organization,
  orgCapabilities,
  userExists,
}: {
  user: User;
  organization: Organization;
  orgCapabilities: string[];
  userExists: boolean;
}) => {
  const [userOrganization] = await insertNewUserOrganization({
    user_id: user.id,
    organization_id: organization.id,
  });
  const { user: contextUser } = requestContext.require();
  await updateUserOrganizationCapability({
    user_organization_id: userOrganization.id,
    capabilities_name: orgCapabilities,
  });
  if (userExists) {
    await sendMail({
      to: user.email,
      template: 'new_user_organization',
      params: {
        organizationName: organization.name,
        userName: `${contextUser.first_name ?? ''} ${contextUser.last_name ?? ''}`,
        invitedName: `${user.first_name ?? ''} ${user.last_name ?? ''}`,
      },
    });
  }
  return true;
};

export const removeUserFromOrganization = async (
  user_id: UserId,
  organization_id: OrganizationId
) => {
  return db<UserOrganization>('User_Organization')
    .where({ user_id, organization_id })
    .delete('*');
};
