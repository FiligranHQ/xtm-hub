import { db } from '../../../../knexfile';
import { requestContext } from '../../../context/request.context';
import { UserOrganizationId } from '../../../model/kanel/public/UserOrganization';
import UserOrganizationCapability, {
  UserOrganizationCapabilityInitializer,
} from '../../../model/kanel/public/UserOrganizationCapability';

export const createUserOrganizationCapability = async ({
  user_organization_id,
  capabilities_name,
}: {
  user_organization_id: UserOrganizationId;
  capabilities_name: string[] | null | undefined;
}): Promise<UserOrganizationCapability[]> => {
  const names = capabilities_name ?? [];
  if (names.length === 0) {
    return [];
  }
  const usersOrgCapa: UserOrganizationCapabilityInitializer[] = names.map(
    (name) => ({
      user_organization_id,
      name,
    })
  );
  return db<UserOrganizationCapability>('UserOrganization_Capability')
    .insert(usersOrgCapa)
    .returning('*');
};

export const updateUserOrganizationCapability = async ({
  user_organization_id,
  capabilities_name,
}: {
  user_organization_id: UserOrganizationId;
  capabilities_name: string[] | null | undefined;
}): Promise<UserOrganizationCapability[]> => {
  await db<UserOrganizationCapability>('UserOrganization_Capability')
    .where({ user_organization_id })
    .delete();

  const names = capabilities_name ?? [];
  if (names.length === 0) {
    return [];
  }
  const usersOrgCapa: UserOrganizationCapabilityInitializer[] = names.map(
    (name) => ({
      user_organization_id,
      name,
    })
  );
  return db<UserOrganizationCapability>('UserOrganization_Capability')
    .insert(usersOrgCapa)
    .returning('*');
};

export const loadUserOrganizationCapabilities = async (
  organizationId: string
): Promise<UserOrganizationCapability[]> => {
  const { user } = requestContext.require();
  const capabilities = await db<UserOrganizationCapability>(
    'UserOrganization_Capability'
  )
    .leftJoin(
      'User_Organization',
      'UserOrganization_Capability.user_organization_id',
      'User_Organization.id'
    )
    .where('User_Organization.organization_id', '=', organizationId)
    .where('User_Organization.user_id', '=', user.id)
    .select('UserOrganization_Capability.*');

  return capabilities;
};
