import { useRegisteredPlatformsListQuery } from '@graphql/generated';

export const registeredPlatformsKeys = {
  all: useRegisteredPlatformsListQuery.getRootKey,
  list: () => useRegisteredPlatformsListQuery.getKey(undefined),
};
