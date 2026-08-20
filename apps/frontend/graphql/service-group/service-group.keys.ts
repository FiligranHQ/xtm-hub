import {
  type BundleUserServiceGroupsQueryVariables,
  useBundleUserServiceGroupsQuery,
} from '@graphql/generated';

export const bundleUserServiceGroupsKeys = {
  all: useBundleUserServiceGroupsQuery.getRootKey,
  list: (variables: BundleUserServiceGroupsQueryVariables) =>
    useBundleUserServiceGroupsQuery.getKey(variables),
};
