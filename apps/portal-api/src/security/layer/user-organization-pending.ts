import { KnexQueryBuilder } from '../../../knexfile';
import { SecuryQueryHandlers } from '../access';

const setDeleteSecurity = (): KnexQueryBuilder => {
  // Implement User_organization_pending-specific insert security logic
  throw new Error('Missing security logic');
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
