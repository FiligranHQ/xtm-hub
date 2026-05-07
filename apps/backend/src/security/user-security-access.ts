import { ActionType } from '../../knexfile';
import { OrganizationCapability } from '../__generated__/resolvers-types';
import { UserLoadUserBy } from '../model/user';
import { TypedNode } from '../pub';
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
  return (
    isUserGranted(opt.user, OrganizationCapability.ManageAccess) ||
    isUserGranted(opt.user, OrganizationCapability.AdministrateOrganization)
  );
};

export const userPendingSSESecurity = (opt: { user: UserLoadUserBy }) => {
  return (
    isUserGranted(opt.user, OrganizationCapability.ManageAccess) ||
    isUserGranted(opt.user, OrganizationCapability.AdministrateOrganization)
  );
};
