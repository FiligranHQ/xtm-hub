import {
  type RegisteredPlatformsQueryVariables,
  type RegisteredSaasPlatformDataQueryVariables,
  useRegisteredPlatformsQuery,
  useRegisteredSaasPlatformDataQuery,
} from '@graphql/generated';

export const registrationKeys = {
  all: useRegisteredPlatformsQuery.getRootKey,
  registeredPlatforms: (variables: RegisteredPlatformsQueryVariables) =>
    useRegisteredPlatformsQuery.getKey(variables),
  registeredSaasPlatformData: (
    variables: RegisteredSaasPlatformDataQueryVariables
  ) => useRegisteredSaasPlatformDataQuery.getKey(variables),
};
