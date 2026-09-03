import {
  type ActiveXtmPlatformBundleQueryVariables,
  type TrialsListQueryVariables,
  type TrialsQuotasQueryVariables,
  useActiveXtmPlatformBundleQuery,
  useTrialsListQuery,
  useTrialsQuotasQuery,
} from '@graphql/generated';

export const trialsKeys = {
  all: useTrialsListQuery.getRootKey,
  list: (variables: TrialsListQueryVariables) =>
    useTrialsListQuery.getKey(variables),
};

export const trialsQuotasKeys = {
  all: useTrialsQuotasQuery.getRootKey,
  list: (variables: TrialsQuotasQueryVariables) =>
    useTrialsQuotasQuery.getKey(variables),
};

export const xtmPlatformBundleKeys = {
  activeXtmPlatformBundle: useActiveXtmPlatformBundleQuery.getRootKey,
  activeXtmPlatformBundleByServiceInstance: (
    variables: ActiveXtmPlatformBundleQueryVariables
  ) => useActiveXtmPlatformBundleQuery.getKey(variables),
};
