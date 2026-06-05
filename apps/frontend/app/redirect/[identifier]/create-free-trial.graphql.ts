import { graphql } from 'react-relay';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CreateFreeTrialAvailableTrials = graphql`
  query createFreeTrialAvailableTrialsQuery($input: TrialDeploymentsInput!) {
    trialDeployments(input: $input) {
      availableTrials
      deployed {
        serviceInstanceId
      }
      isBlacklisted
    }
  }
`;
