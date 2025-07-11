import { db, dbUnsecure } from '../../../knexfile';
import { UserOrganizationId } from '../../model/kanel/public/UserOrganization';
import UserOrganizationCapability, {
  UserOrganizationCapabilityInitializer,
} from '../../model/kanel/public/UserOrganizationCapability';
import { PortalContext } from '../../model/portal-context';

export const createUserOrganizationCapability = async ({
  user_organization_id,
  capabilities_name = [],
}: {
  user_organization_id: UserOrganizationId;
  capabilities_name: string[];
}): Promise<UserOrganizationCapability[]> => {
  if (capabilities_name.length === 0) {
    return [];
  }
  const usersOrgCapa: UserOrganizationCapabilityInitializer[] =
    capabilities_name.map((name) => ({
      user_organization_id,
      name,
    }));
  return dbUnsecure('UserOrganization_Capability')
    .insert(usersOrgCapa)
    .returning('*');
};

export const updateUserOrganizationCapability = async (
  context: PortalContext,
  {
    user_organization_id,
    capabilities_name = [],
  }: {
    user_organization_id: UserOrganizationId;
    capabilities_name: string[];
  }
): Promise<UserOrganizationCapability[]> => {
  await db(context, 'UserOrganization_Capability')
    .where({ user_organization_id })
    .delete()
    .secureQuery();

  if (capabilities_name.length === 0) {
    return [];
  }
  const usersOrgCapa: UserOrganizationCapabilityInitializer[] =
    capabilities_name.map((name) => ({
      user_organization_id,
      name,
    }));
  return db(context, 'UserOrganization_Capability')
    .insert(usersOrgCapa)
    .returning('*')
    .secureQuery();
};
