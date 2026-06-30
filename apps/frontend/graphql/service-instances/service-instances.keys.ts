import {
  type ServiceInstancesListQueryVariables,
  useServiceInstancesListQuery,
} from '@graphql/generated';

export const serviceInstancesKeys = {
  all: useServiceInstancesListQuery.getRootKey,
  list: (variables: ServiceInstancesListQueryVariables) =>
    useServiceInstancesListQuery.getKey(variables),
};
