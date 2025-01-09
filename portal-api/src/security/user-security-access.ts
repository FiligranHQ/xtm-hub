import { ActionType } from '../../knexfile';
import { PortalContext } from '../model/portal-context';
import { UserLoadUserBy } from '../model/user';
import { CAPABILITY_BYPASS, CAPABILITY_FRT_MANAGE_USER } from '../portal.const';
import { TypedNode } from '../pub';
import { isUserGranted } from './access';

// Used to check access in SSE
export const checkIsNodeAccessibleMeUser = (
  user: UserLoadUserBy,
  data: { [action in ActionType]: TypedNode }
) => {
  const actions = ['delete', 'edit'];
  for (const action of actions) {
    if (data[action]?.id === user.id) {
      return true;
    }
  }
  return false;
};

// Used to check access in SSE

export const checkIsNodeAccessibleUser = (user: UserLoadUserBy) => {
  if (isUserGranted(user, CAPABILITY_BYPASS)) {
    return true;
  }
  return isUserGranted(user, CAPABILITY_FRT_MANAGE_USER);
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
