import { ForbiddenAccess } from '@xtm-hub/error';
import { dbUnsecure } from '../../../knexfile';
import { OrganizationCapability } from '../../__generated__/resolvers-types';
import { PortalContext } from '../../model/portal-context';

export const checkUserCapabilities = async (
  context: PortalContext,
  requiredCapabilities: OrganizationCapability[]
) => {
  // TODO Replace this query by adding a mapping org/capa and check the user capabilities depending of the organization
  const getUserCapability = await dbUnsecure('User')
    .leftJoin('User_Organization', 'User.id', 'User_Organization.user_id')
    .leftJoin(
      'UserOrganization_Capability',
      'User_Organization.id',
      'UserOrganization_Capability.user_organization_id'
    )
    .where({
      'User.id': context.user.id,
    })
    .whereIn('UserOrganization_Capability.name', requiredCapabilities)
    .first();

  if (!getUserCapability) {
    throw ForbiddenAccess('Not authorized');
  }
};
