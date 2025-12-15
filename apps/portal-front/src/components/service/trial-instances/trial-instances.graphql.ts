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

export const CancelDeploymentRequestMutation = graphql`
  mutation trialInstancesCancelDeploymentRequestMutation(
    $deploymentRequestId: ID!
  ) {
    cancelDeploymentRequest(deploymentRequestId: $deploymentRequestId) {
      id
      region
      type
      platform_identifier
      hub_status
      counts_in_orga_quota
    }
  }
`;
