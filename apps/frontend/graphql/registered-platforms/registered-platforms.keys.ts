import {
  type RegisteredPlatformsListQueryVariables,
  useRegisteredPlatformsListQuery,
} from '@graphql/generated';

export const registeredPlatformsKeys = {
  all: useRegisteredPlatformsListQuery.getRootKey,
  list: (variables: RegisteredPlatformsListQueryVariables) =>
    useRegisteredPlatformsListQuery.getKey(variables),
};
