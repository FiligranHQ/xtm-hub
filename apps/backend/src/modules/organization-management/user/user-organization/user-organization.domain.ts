import { db } from '../../../../../knexfile';
import {
  OrganizationCapabilitiesInput,
  OrganizationCapability,
} from '../../../../__generated__/resolvers-types';
import { requestContext } from '../../../../context/request.context';
import Organization, {
  OrganizationId,
} from '../../../../model/kanel/public/Organization';
import User, { UserId } from '../../../../model/kanel/public/User';
import UserOrganization, {
  UserOrganizationInitializer,
  UserOrganizationMutator,
} from '../../../../model/kanel/public/UserOrganization';
import { securityGuard } from '../../../../security/guard';
import { sendMail } from '../../../../server/mail-service';
import { isEmpty } from '../../../../utils/utils';
import {
  createUserOrganizationCapability,
  updateUserOrganizationCapability,
} from '../../../security-management/user-organization-capability/user-organization-capability.domain';
import { UserOrganizationPendingDomain } from '../user-pending/user-organization-pending.domain';

export const UserOrganizationDomain = {
  insertNewUserOrganization: (
    field: UserOrganizationInitializer | UserOrganizationInitializer[]
  ): Promise<UserOrganization[]> => {
    return db('User_Organization').insert(field).returning('*');
  },

  createUserOrganizationRelationAndRemovePending: async ({
    user_id,
    organizations_id = [],
  }: {
    user_id: UserId;
    organizations_id: OrganizationId[];
  }): Promise<UserOrganization[]> => {
    await Promise.all(
      organizations_id.map((org) =>
        UserOrganizationPendingDomain.removeUserFromOrganizationPending(
          user_id,
          org
        )
      )
    );

    return UserOrganizationDomain.createUserOrganizationRelation({
      user_id,
      organizations_id,
    });
  },

  createUserOrganizationRelation: async ({
    user_id,
    organizations_id = [],
  }: {
    user_id: UserId;
    organizations_id: OrganizationId[];
  }): Promise<UserOrganization[]> => {
    const usersOrganization: UserOrganizationInitializer[] =
      organizations_id.map((organization_id) => ({
        user_id,
        organization_id,
      }));
    return UserOrganizationDomain.insertNewUserOrganization(usersOrganization);
  },

  loadUserOrganization: (
    field: UserOrganizationMutator
  ): Promise<UserOrganization[]> => {
    return db<UserOrganization>('User_Organization').where(field);
  },

  updateMultipleUserOrgWithCapabilities: async (
    userId: UserId,
    orgCapabilities?: OrganizationCapabilitiesInput[] | null
  ) => {
    await db<UserOrganization>('User_Organization')
      .where('user_id', '=', userId)
      .whereNot('organization_id', userId) // Should not touch personal space
      .del();
    const safeCapabilities = orgCapabilities ?? [];
    if (isEmpty(safeCapabilities)) {
      return;
    }
    for (const orgCapa of safeCapabilities) {
      const organization_id = orgCapa.organization_id;
      if (organization_id !== userId.toString()) {
        const [newUserOrganization] =
          await UserOrganizationDomain.insertNewUserOrganization({
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
  },

  updateUserOrgCapabilities: async ({
    user_id,
    organization_id,
    orgCapabilities,
  }: {
    user_id: UserId;
    organization_id: OrganizationId;
    orgCapabilities?: string[] | null;
  }) => {
    await securityGuard.assertUserCapabilities(
      [
        OrganizationCapability.AdministrateOrganization,
        OrganizationCapability.ManageAccess,
      ],
      organization_id
    );

    const [userOrganization] =
      await UserOrganizationDomain.loadUserOrganization({
        user_id,
        organization_id,
      });
    await updateUserOrganizationCapability({
      user_organization_id: userOrganization.id,
      capabilities_name: orgCapabilities,
    });
    return true;
  },

  createUserOrgCapabilities: async ({
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
    const [userOrganization] =
      await UserOrganizationDomain.insertNewUserOrganization({
        user_id: user.id,
        organization_id: organization.id,
      });
    const { user: contextUser } = requestContext.require();
    await securityGuard.assertUserCapabilities(
      [
        OrganizationCapability.AdministrateOrganization,
        OrganizationCapability.ManageAccess,
      ],
      organization.id
    );

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
  },

  removeUserFromOrganization: async (
    user_id: UserId,
    organization_id: OrganizationId
  ) => {
    return db<UserOrganization>('User_Organization')
      .where({ user_id, organization_id })
      .delete('*');
  },

  removeUserFromPendingList: async ({
    user_id,
    organization_id,
  }: {
    user_id: UserId;
    organization_id: OrganizationId;
  }) => {
    return db('User_Organization_Pending')
      .where({
        user_id,
        organization_id,
      })
      .del()
      .returning('id');
  },
};
