import {
  type PrivateNavigationServiceInstancesQueryVariables,
  type PrivateNavigationTrialEligibilityQueryVariables,
  usePrivateNavigationServiceInstancesQuery,
  usePrivateNavigationTrialEligibilityQuery,
} from '@graphql/generated';

export const privateNavigationKeys = {
  all: usePrivateNavigationServiceInstancesQuery.getRootKey,
  list: (variables: PrivateNavigationServiceInstancesQueryVariables) =>
    usePrivateNavigationServiceInstancesQuery.getKey(variables),
  trialEligibilityAll: usePrivateNavigationTrialEligibilityQuery.getRootKey,
  trialEligibility: (
    variables: PrivateNavigationTrialEligibilityQueryVariables
  ) => usePrivateNavigationTrialEligibilityQuery.getKey(variables),
};
