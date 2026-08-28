import {
  ActiveXtmPlatformBundleQueryVariables,
  useActiveXtmPlatformBundleQuery,
} from '@graphql/generated';

export const xtmPlatformBundleKeys = {
  activeXtmPlatformBundle: useActiveXtmPlatformBundleQuery.getRootKey,
  activeXtmPlatformBundleByServiceInstance: (
    variables: ActiveXtmPlatformBundleQueryVariables
  ) => useActiveXtmPlatformBundleQuery.getKey(variables),
};
