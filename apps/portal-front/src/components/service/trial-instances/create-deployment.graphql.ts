import { graphql } from 'react-relay';

export const CreateDeploymentRequestMutation = graphql`
  mutation createDeploymentRequestMutation(
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
