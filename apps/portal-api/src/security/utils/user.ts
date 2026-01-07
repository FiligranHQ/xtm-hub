import crypto from 'node:crypto';
import { db } from '../../../knexfile';
import { OrganizationCapability } from '../../__generated__/resolvers-types';
import { requestContext } from '../../context/request.context';
import { ForbiddenAccess } from '../../utils/error/error.util';

export const checkUserCapabilities = async (
  requiredCapabilities: OrganizationCapability[]
) => {
  const { user } = requestContext.require();
  // TODO Replace this query by adding a mapping org/capa and check the user capabilities depending of the organization
  const getUserCapability = await db('User')
    .leftJoin('User_Organization', 'User.id', 'User_Organization.user_id')
    .leftJoin(
      'UserOrganization_Capability',
      'User_Organization.id',
      'UserOrganization_Capability.user_organization_id'
    )
    .where({
      'User.id': user.id,
    })
    .whereIn('UserOrganization_Capability.name', requiredCapabilities)
    .first();

  if (!getUserCapability) {
    throw ForbiddenAccess('Not authorized');
  }
};

export const validatePassword = (salt, tentativePassword, realPassword) => {
  const hash = crypto
    .pbkdf2Sync(tentativePassword, salt, 1000, 64, `sha512`)
    .toString(`hex`);
  return realPassword === hash;
};
