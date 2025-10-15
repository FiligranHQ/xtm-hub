import { KnexQueryBuilder } from '../../../knexfile';
import { requestContext } from '../../requestContext';
import { SecuryQueryHandlers } from '../access';

/**
 * Apply security rules for Document table operations
 */
export const setSelectSecurity = (qb: KnexQueryBuilder) => {
  const context = requestContext.require();
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

export const setInsertSecurity = (qb: KnexQueryBuilder) => {
  //Can be remove after implementing security.
  requestContext.require();
  if (!qb) {
    throw new Error('Invalid parameters');
  }

  // Implement document-specific insert security logic
  throw new Error('Missing insert security logic');
};

export const setUpdateSecurity = (qb: KnexQueryBuilder) => {
  //Can be remove after implementing security.
  requestContext.require();
  if (!qb) {
    throw new Error('Invalid parameters');
  }

  // Implement document-specific update security logic
  throw new Error('Missing update security logic');
};

export const setDeleteSecurity = (qb: KnexQueryBuilder) => {
  //Can be remove after implementing security.
  requestContext.require();
  if (!qb) {
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
