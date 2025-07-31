import { KnexQueryBuilder } from '../../../knexfile';
import { OrganizationCapability } from '../../__generated__/resolvers-types';
import { SecuryQueryHandlers } from '../access';
import { PortalContext } from '../../model/portal-context';
import { checkUserCapabilities } from '../utils/user';

/**
 * Apply security rules for User_organization table operations
 */

export const setSelectSecurity = (
  context: PortalContext,
  qb: KnexQueryBuilder
) => {
  //Can be remove after implementing security.
  if (!context || !qb) {
    throw new Error('Invalid parameters');
  }

  // Implement document-specific select security logic
  throw new Error('Missing security logic');
};

export const setInsertSecurity = async (
  context: PortalContext,
  qb: KnexQueryBuilder
) => {
  await checkUserCapabilities(context, [
    OrganizationCapability.AdministrateOrganization,
    OrganizationCapability.ManageAccess,
  ]);
  return qb;
};

export const setUpdateSecurity = async (
  context: PortalContext,
  qb: KnexQueryBuilder
) => {
  await checkUserCapabilities(context, [
    OrganizationCapability.AdministrateOrganization,
    OrganizationCapability.ManageAccess,
  ]);
  return qb;
};

export const setDeleteSecurity = async (
  context: PortalContext,
  qb: KnexQueryBuilder
) => {
  await checkUserCapabilities(context, [
    OrganizationCapability.AdministrateOrganization,
    OrganizationCapability.ManageAccess,
  ]);
  return qb;
};

export const userOrganizationSecurityLayer: SecuryQueryHandlers = {
  select: setSelectSecurity,
  insert: setInsertSecurity,
  update: setUpdateSecurity,
  del: setDeleteSecurity,
};
