import { KnexQueryBuilder } from '../../../knexfile';
import { requireRequestContext } from '../../requestContext';
import { SecuryQueryHandlers } from '../access';

export const setSelectSecurity = (qb: KnexQueryBuilder) => {
  requireRequestContext();
  if (!qb) {
    throw new Error('Invalid parameters');
  }
  return qb;
};

export const setInsertSecurity = (qb: KnexQueryBuilder) => {
  requireRequestContext();
  if (!qb) {
    throw new Error('Invalid parameters');
  }
  return qb;
};

export const setUpdateSecurity = (qb: KnexQueryBuilder) => {
  requireRequestContext();
  if (!qb) {
    throw new Error('Invalid parameters');
  }
  return qb;
};

export const setDeleteSecurity = (qb: KnexQueryBuilder) => {
  requireRequestContext();
  if (!qb) {
    throw new Error('Invalid parameters');
  }
  return qb;
};

export const serviceDefinitionSecurityLayer: SecuryQueryHandlers = {
  select: setSelectSecurity,
  insert: setInsertSecurity,
  update: setUpdateSecurity,
  del: setDeleteSecurity,
};
