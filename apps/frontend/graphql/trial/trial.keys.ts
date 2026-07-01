import {
  type TrialDeploymentsEligibilityQueryVariables,
  useTrialDeploymentsEligibilityQuery,
} from '@graphql/generated';

export const trialKeys = {
  trialDeploymentsEligibilityAll:
    useTrialDeploymentsEligibilityQuery.getRootKey,
  trialDeploymentsEligibility: (
    variables: TrialDeploymentsEligibilityQueryVariables
  ) => useTrialDeploymentsEligibilityQuery.getKey(variables),
};
