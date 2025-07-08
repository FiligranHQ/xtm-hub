import { KnexQueryBuilder } from '../../../knexfile';
import { OrganizationCapability } from '../../__generated__/resolvers-types';
import { PortalContext } from '../../model/portal-context';
import { SecuryQueryHandlers } from '../access';
import { checkUserCapabilities } from '../utils/user';

const setDeleteSecurity = (
  context: PortalContext,
  qb: KnexQueryBuilder
): KnexQueryBuilder => {
  qb.innerJoin(
    'User_Organization as securityUserOrg',
    'User.id',
    '=',
    'securityUserOrg.user_id'
  ).where(
    'securityUserOrg.organization_id',
    '=',
    context.user.selected_organization_id
  );
  return qb;
};

/**
 * Apply security rules for UserService_Capability table operations
 */
const setInsertSecurity = (): KnexQueryBuilder => {
  // Implement UserService_Capability-specific insert security logic
  throw new Error('Missing security logic');
};

const setUpdateSecurity = async (
  context: PortalContext,
  qb: KnexQueryBuilder
) => {
  await checkUserCapabilities(context, [
    OrganizationCapability.AdministrateOrganization,
    OrganizationCapability.ManageAccess,
  ]);
  return qb;
};

const setSelectSecurity = (): KnexQueryBuilder => {
  // Implement UserService_Capability-specific select security logic
  throw new Error('Missing security logic');
};

export const userServiceCapabilitySecurityLayer: SecuryQueryHandlers = {
  select: setSelectSecurity,
  insert: setInsertSecurity,
  update: setUpdateSecurity,
  del: setDeleteSecurity,
};
