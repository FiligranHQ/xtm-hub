import { KnexQueryBuilder } from '../../../knexfile';
import { PortalContext } from '../../model/portal-context';
import { SecuryQueryHandlers } from '../access';

export const setSelectSecurity = (
  context: PortalContext,
  qb: KnexQueryBuilder
) => {
  if (!context || !qb) {
    throw new Error('Invalid parameters');
  }
  return qb;
};

export const setInsertSecurity = (
  context: PortalContext,
  qb: KnexQueryBuilder
) => {
  if (!context || !qb) {
    throw new Error('Invalid parameters');
  }
  return qb;
};

export const setUpdateSecurity = (
  context: PortalContext,
  qb: KnexQueryBuilder
) => {
  if (!context || !qb) {
    throw new Error('Invalid parameters');
  }
  return qb;
};

export const setDeleteSecurity = (
  context: PortalContext,
  qb: KnexQueryBuilder
) => {
  if (!context || !qb) {
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
