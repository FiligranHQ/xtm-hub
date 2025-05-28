import { Knex } from 'knex';
import { ActionType, dbUnsecure, QueryOpts } from '../../knexfile';
import { PortalContext } from '../model/portal-context';
import { UserLoadUserBy } from '../model/user';
import { OrganizationCapabilityName } from '../modules/common/user-organization-capability.const';
import { GenericServiceCapabilityName } from '../modules/user_service/service-capability/generic_service_capability.const';
import { TypedNode } from '../pub';
import { ForbiddenAccess } from '../utils/error.util';
import { isUserGranted } from './access';

// Used to check access in SSE
export const meUserSSESecurity = (opt: {
  user: UserLoadUserBy;
  data: { [action in ActionType]: TypedNode };
}) => {
  const actions = ['delete', 'edit'];
  for (const action of actions) {
    if (opt.data[action]?.id === opt.user.id) {
      return true;
    }
  }
  return false;
};

// Used to check access in SSE

export const userSSESecurity = (opt: { user: UserLoadUserBy }) => {
  return isUserGranted(opt.user, GenericServiceCapabilityName.MANAGE_ACCESS);
};

export const setQueryForUser = <T>(
  context: PortalContext,
  queryContext: Knex.QueryBuilder<T>
): Knex.QueryBuilder<T> => {
  queryContext
    .innerJoin(
      'User_Organization as securityUserOrg',
      'User.id',
      '=',
      'securityUserOrg.user_id'
    )
    .where(
      'securityUserOrg.organization_id',
      '=',
      context.user.selected_organization_id
    );
  return queryContext;
};

export const setUpdateSecurityForUser = <T>(
  context: PortalContext,
  queryContext: Knex.QueryBuilder<T>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  opts: QueryOpts
): Knex.QueryBuilder<T> => {
  // TODO Apply Db security for Updating
  const getUserCapability = dbUnsecure('User')
    .leftJoin('User_Organization', 'User.id', 'User_Organization.user_id')
    .leftJoin(
      'UserOrganization_Capability',
      'User_Organization.id',
      'UserOrganization_Capability.user_organization_id'
    )
    .where({
      id: context.user.id,
      'UserOrganization_Capability.name':
        OrganizationCapabilityName.MANAGE_ACCESS,
    })
    .first();
  if (!getUserCapability) {
    throw ForbiddenAccess('Insufficient right');
  }
  return queryContext;
};
