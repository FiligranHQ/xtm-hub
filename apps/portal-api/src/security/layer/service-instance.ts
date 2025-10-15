import { KnexQueryBuilder } from '../../../knexfile';
import { requestContext } from '../../requestContext';
import { SecuryQueryHandlers } from '../access';

export const setSelectSecurity = (qb: KnexQueryBuilder) => {
  requestContext.require();
  if (!qb) {
    throw new Error('Invalid parameters');
  }
  return qb;
};

export const setInsertSecurity = (qb: KnexQueryBuilder) => {
  requestContext.require();
  if (!qb) {
    throw new Error('Invalid parameters');
  }
  return qb;
};

export const setUpdateSecurity = (qb: KnexQueryBuilder) => {
  requestContext.require();
  if (!qb) {
    throw new Error('Invalid parameters');
  }
  return qb;
};

export const setDeleteSecurity = (qb: KnexQueryBuilder) => {
  requestContext.require();
  if (!qb) {
    throw new Error('Invalid parameters');
  }
  return qb;
};

export const serviceInstanceSecurityLayer: SecuryQueryHandlers = {
  select: setSelectSecurity,
  insert: setInsertSecurity,
  update: setUpdateSecurity,
  del: setDeleteSecurity,
};
