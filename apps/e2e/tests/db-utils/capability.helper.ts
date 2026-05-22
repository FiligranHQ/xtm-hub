import { db } from './db-connection';

export const getUserOrganizationCapabilityNames = async (
  email: string,
  organizationName: string
): Promise<string[]> => {
  const capabilities = await db('UserOrganization_Capability')
    .select('UserOrganization_Capability.name')
    .leftJoin(
      'User_Organization',
      'User_Organization.id',
      'UserOrganization_Capability.user_organization_id'
    )
    .leftJoin(
      'Organization',
      'Organization.id',
      'User_Organization.organization_id'
    )
    .leftJoin('User', 'User.id', 'User_Organization.user_id')
    .where('User.email', '=', email)
    .andWhere('Organization.name', '=', organizationName);

  return capabilities.map(({ name }) => name);
};
