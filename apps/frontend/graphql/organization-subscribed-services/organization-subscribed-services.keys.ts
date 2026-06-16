import {
  type OrganizationSubscribedServicesListQueryVariables,
  useOrganizationSubscribedServicesListQuery,
} from '@graphql/generated';

export const organizationSubscribedServicesKeys = {
  all: useOrganizationSubscribedServicesListQuery.getRootKey,
  list: (variables: OrganizationSubscribedServicesListQueryVariables) =>
    useOrganizationSubscribedServicesListQuery.getKey(variables),
};
