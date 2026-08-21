import {
  type PlatformTrialStatusQueryVariables,
  type TrialDeploymentsEligibilityQueryVariables,
  usePlatformTrialStatusQuery,
  useTrialDeploymentsEligibilityQuery,
} from '@graphql/generated';

export const trialKeys = {
  trialDeploymentsEligibilityAll:
    useTrialDeploymentsEligibilityQuery.getRootKey,
  trialDeploymentsEligibility: (
    variables: TrialDeploymentsEligibilityQueryVariables
  ) => useTrialDeploymentsEligibilityQuery.getKey(variables),
};

export const platformTrialKeys = {
  platformTrialStatusAll: usePlatformTrialStatusQuery.getRootKey,
  platformTrialStatus: (variables: PlatformTrialStatusQueryVariables) =>
    usePlatformTrialStatusQuery.getKey(variables),
};
