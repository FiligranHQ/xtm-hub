import { graphql } from 'react-relay';

export const CreateDeploymentRequestMutation = graphql`
  mutation trialInstancesCreateDeploymentRequestMutation(
    $input: CreateDeploymentRequestInput!
  ) {
    createDeploymentRequest(input: $input) {
      id
      region
      type
      platform_identifier
      status
    }
  }
`;

export const DeploymentRequestsAvailableQuery = graphql`
  query trialInstancesDeploymentRequestsAvailableQuery(
    $platformIdentifier: PlatformIdentifier!
  ) {
    deploymentRequestsAvailable(platformIdentifier: $platformIdentifier) {
      region
      availableCount
    }
  }
`;
