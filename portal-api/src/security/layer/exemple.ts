/**
 * This file serves as a template/example for implementing security layers.
 * Use this as a reference when creating new security layer implementations.
 * DO NOT MODIFY THIS FILE - create a new file for your specific security layer instead.
 */

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
  //Can be remove after implementing security.
  if (!context || !qb) {
    throw new Error('Invalid parameters');
  }

  // Implement document-specific select security logic
  throw new Error('Missing select security logic');
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

export const securityLayer: SecuryQueryHandlers = {
  select: setSelectSecurity,
  insert: setInsertSecurity,
  update: setUpdateSecurity,
  del: setDeleteSecurity,
  delete: setDeleteSecurity,
};
