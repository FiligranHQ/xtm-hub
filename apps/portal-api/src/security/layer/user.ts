import { KnexQueryBuilder } from '../../../knexfile';
import { OrganizationCapability } from '../../__generated__/resolvers-types';
import { requireRequestContext } from '../../requestContext';
import { SecuryQueryHandlers } from '../access';
import { checkUserCapabilities } from '../utils/user';

export const setSelectSecurity = (qb: KnexQueryBuilder): KnexQueryBuilder => {
  const requestContext = requireRequestContext();
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
      requestContext.user.selected_organization_id
    );
};
export const setInsertSecurity = (qb: KnexQueryBuilder) => {
  requireRequestContext();
  if (!qb) {
    throw new Error('Invalid parameters');
  }
  // Implement user-specific insert security logic
  throw new Error('Missing security logic');
};

export const setUpdateSecurity = async (qb: KnexQueryBuilder) => {
  await checkUserCapabilities([
    OrganizationCapability.AdministrateOrganization,
    OrganizationCapability.ManageAccess,
  ]);
  return qb;
};

export const setDeleteSecurity = (qb: KnexQueryBuilder) => {
  // Validate parameters exist
  requireRequestContext();
  if (!qb) {
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
};
