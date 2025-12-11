import { Auth0UpdateUserRBACInstance } from './client';

export const removeEmptyGroups = (
  instance: Auth0UpdateUserRBACInstance
): Auth0UpdateUserRBACInstance => {
  const filtered: Auth0UpdateUserRBACInstance = {};

  for (const [key, value] of Object.entries(instance)) {
    if (value.groups && value.groups.length > 0) {
      filtered[key] = value;
    }
  }

  return filtered;
};
