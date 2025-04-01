import { KnexQueryBuilder } from '../../../knexfile';
import { OrganizationCapability } from '../../__generated__/resolvers-types';
import { PortalContext } from '../../model/portal-context';
import { SecuryQueryHandlers } from '../access';
import { checkUserCapabilities } from '../utils/user';

export const setSelectSecurity = (
  context: PortalContext,
  qb: KnexQueryBuilder
): KnexQueryBuilder => {
  return qb
    .innerJoin(
      'User_Organization as securityUserOrg',
      'User.id',
      '=',
      'securityUserOrg.user_id'
    )
    .where(
      'securityUserOrg.organization_id',
      '=',
      context.user.selected_organization_id
    );
};
export const setInsertSecurity = (
  context: PortalContext,
  qb: KnexQueryBuilder
) => {
  if (!context || !qb) {
    throw new Error('Invalid parameters');
  }
  // Implement user-specific insert security logic
  throw new Error('Missing security logic');
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

export const setDeleteSecurity = (
  context: PortalContext,
  qb: KnexQueryBuilder
) => {
  // Validate parameters exist
  if (!context || !qb) {
    throw new Error('Invalid parameters');
  }

  // Implement user-specific delete security logic
  throw new Error('Missing security logic');
};

export const userSecurityLayer: SecuryQueryHandlers = {
  select: setSelectSecurity,
  insert: setInsertSecurity,
  update: setUpdateSecurity,
  del: setDeleteSecurity,
  delete: setDeleteSecurity,
};
