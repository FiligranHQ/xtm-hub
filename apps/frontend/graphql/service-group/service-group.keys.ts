import {
  type BundleProductsQueryVariables,
  type BundleUserServiceGroupsQueryVariables,
  useBundleProductsQuery,
  useBundleUserServiceGroupsQuery,
} from '@graphql/generated';

export const bundleUserServiceGroupsKeys = {
  all: useBundleUserServiceGroupsQuery.getRootKey,
  list: (variables: BundleUserServiceGroupsQueryVariables) =>
    useBundleUserServiceGroupsQuery.getKey(variables),
};

export const bundleProductsKeys = {
  all: useBundleProductsQuery.getRootKey,
  list: (variables: BundleProductsQueryVariables) =>
    useBundleProductsQuery.getKey(variables),
};
