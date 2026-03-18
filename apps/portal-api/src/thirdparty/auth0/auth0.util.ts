import { Management } from 'auth0';
import { Auth0UpdateUserRBACInstance } from './client';

export const removeEmptyGroups = (
  instance: Auth0UpdateUserRBACInstance
): Auth0UpdateUserRBACInstance => {
  const filtered: Auth0UpdateUserRBACInstance = {};

  for (const [key, value] of Object.entries(instance)) {
    if (
      value?.groups &&
      Array.isArray(value.groups) &&
      value.groups.length > 0
    ) {
      filtered[key] = value;
    }
  }

  return filtered;
};

export const buildUserMetadataUpdate = (
  auth0_user: Management.UserResponseSchema,
  userRBACInstance: Auth0UpdateUserRBACInstance
) => {
  return {
    user_metadata: {
      ...auth0_user.user_metadata,
      rbac_instance: removeEmptyGroups({
        ...((auth0_user.user_metadata
          ?.rbac_instance as Auth0UpdateUserRBACInstance) ?? {}),
        ...userRBACInstance,
      }),
    },
  };
};
