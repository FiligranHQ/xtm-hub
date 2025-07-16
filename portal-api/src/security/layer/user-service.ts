import { KnexQueryBuilder } from '../../../knexfile';
import { PortalContext } from '../../model/portal-context';
import { SecuryQueryHandlers } from '../access';

/**
 * Apply security rules for Document table operations
 */
export const setSelectSecurity = (
  context: PortalContext,
  qb: KnexQueryBuilder
) => {
  return qb
    .innerJoin(
      'Subscription as securitySubscription',
      'User_Service.subscription_id',
      '=',
      'securitySubscription.id'
    )
    .where(
      'securitySubscription.organization_id',
      context.user.selected_organization_id
    );
};

export const setInsertSecurity = (
  context: PortalContext,
  qb: KnexQueryBuilder
) => {
  //Can be remove after implementing security.
  if (!context || !qb) {
    throw new Error('Invalid parameters');
  }

  // Implement document-specific insert security logic
  throw new Error('Missing insert security logic');
};

export const setUpdateSecurity = (
  context: PortalContext,
  qb: KnexQueryBuilder
) => {
  //Can be remove after implementing security.
  if (!context || !qb) {
    throw new Error('Invalid parameters');
  }

  // Implement document-specific update security logic
  throw new Error('Missing update security logic');
};

export const setDeleteSecurity = (
  context: PortalContext,
  qb: KnexQueryBuilder
) => {
  //Can be remove after implementing security.
  if (!context || !qb) {
    throw new Error('Invalid parameters');
  }
  // Implement document-specific delete security logic
  throw new Error('Missing delete security logic');
};

export const userServiceSecurityLayer: SecuryQueryHandlers = {
  select: setSelectSecurity,
  insert: setInsertSecurity,
  update: setUpdateSecurity,
  del: setDeleteSecurity,
};
