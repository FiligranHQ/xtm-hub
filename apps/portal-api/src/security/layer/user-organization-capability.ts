import { KnexQueryBuilder } from '../../../knexfile';
import { OrganizationCapability } from '../../__generated__/resolvers-types';
import { requestContext } from '../../context/request.context';
import { SecuryQueryHandlers } from '../access';
import { checkUserCapabilities } from '../utils/user';

/**
 * Apply security rules for Document table operations
 */
export const setSelectSecurity = (qb: KnexQueryBuilder) => {
  //Can be remove after implementing security.
  requestContext.require();
  if (!qb) {
    throw new Error('Invalid parameters');
  }

  // Implement document-specific select security logic
  throw new Error('Missing security logic');
};

export const setInsertSecurity = async (qb: KnexQueryBuilder) => {
  await checkUserCapabilities([
    OrganizationCapability.AdministrateOrganization,
    OrganizationCapability.ManageAccess,
  ]);
  return qb;
};

export const setUpdateSecurity = async (qb: KnexQueryBuilder) => {
  await checkUserCapabilities([
    OrganizationCapability.AdministrateOrganization,
    OrganizationCapability.ManageAccess,
  ]);
  return qb;
};

export const setDeleteSecurity = async (qb: KnexQueryBuilder) => {
  await checkUserCapabilities([
    OrganizationCapability.AdministrateOrganization,
    OrganizationCapability.ManageAccess,
  ]);
  return qb;
};

export const userOrganizationCapabilitySecurityLayer: SecuryQueryHandlers = {
  select: setSelectSecurity,
  insert: setInsertSecurity,
  update: setUpdateSecurity,
  del: setDeleteSecurity,
};
