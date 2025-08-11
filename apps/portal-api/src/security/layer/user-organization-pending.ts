import { KnexQueryBuilder } from '../../../knexfile';
import { OrganizationCapability } from '../../__generated__/resolvers-types';
import { PortalContext } from '../../model/portal-context';
import { SecuryQueryHandlers } from '../access';
import { checkUserCapabilities } from '../utils/user';

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

/**
 * Apply security rules for User_organization_pending table operations
 */
const setInsertSecurity = (): KnexQueryBuilder => {
  // Implement User_organization_pending-specific insert security logic
  throw new Error('Missing security logic');
};

const setUpdateSecurity = (): KnexQueryBuilder => {
  // Implement User_organization_pending-specific update security logic
  throw new Error('Missing security logic');
};

const setSelectSecurity = (): KnexQueryBuilder => {
  // Implement User_organization_pending-specific select security logic
  throw new Error('Missing security logic');
};

export const userOrganizationPendingSecurityLayer: SecuryQueryHandlers = {
  select: setSelectSecurity,
  insert: setInsertSecurity,
  update: setUpdateSecurity,
  del: setDeleteSecurity,
};
