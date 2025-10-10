import { dbUnsecure } from '../../../knexfile';
import { OrganizationCapability } from '../../__generated__/resolvers-types';
import { requireRequestContext } from '../../requestContext';
import { ForbiddenAccess } from '../../utils/error/error.util';

export const checkUserCapabilities = async (
  requiredCapabilities: OrganizationCapability[]
) => {
  const requestContext = requireRequestContext();
  // TODO Replace this query by adding a mapping org/capa and check the user capabilities depending of the organization
  const getUserCapability = await dbUnsecure('User')
    .leftJoin('User_Organization', 'User.id', 'User_Organization.user_id')
    .leftJoin(
      'UserOrganization_Capability',
      'User_Organization.id',
      'UserOrganization_Capability.user_organization_id'
    )
    .where({
      'User.id': requestContext.user.id,
    })
    .whereIn('UserOrganization_Capability.name', requiredCapabilities)
    .first();

  if (!getUserCapability) {
    throw ForbiddenAccess('Not authorized');
  }
};
