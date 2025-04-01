/**
 * This file serves as a template/example for implementing security layers.
 * Use this as a reference when creating new security layer implementations.
 * DO NOT MODIFY THIS FILE - create a new file for your specific security layer instead.
 */

import { KnexQueryBuilder } from '../../../knexfile';
import { OrganizationCapability } from '../../__generated__/resolvers-types';
import { PortalContext } from '../../model/portal-context';
import { SecuryQueryHandlers } from '../access';
import { checkUserCapabilities } from '../utils/user';

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
  throw new Error('Missing security logic');
};

export const setInsertSecurity = async (
  context: PortalContext,
  qb: KnexQueryBuilder
) => {
  await checkUserCapabilities(context, [
    OrganizationCapability.AdministrateOrganization,
    OrganizationCapability.ManageAccess,
  ]);
  return qb;
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

export const setDeleteSecurity = async (
  context: PortalContext,
  qb: KnexQueryBuilder
) => {
  await checkUserCapabilities(context, [
    OrganizationCapability.AdministrateOrganization,
    OrganizationCapability.ManageAccess,
  ]);
  return qb;
};

export const userOrganizationCapabilitySecurityLayer: SecuryQueryHandlers = {
  select: setSelectSecurity,
  insert: setInsertSecurity,
  update: setUpdateSecurity,
  del: setDeleteSecurity,
  delete: setDeleteSecurity,
};
