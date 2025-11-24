import { graphql } from 'react-relay';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CreateFreeTrialRegisteredPlatformsStatusAndTypeQuery = graphql`
  query createFreeTrialRegisteredPlatformsStatusAndTypeQuery(
    $input: RegisteredPlatformsInput
  ) {
    registeredPlatforms(input: $input) {
      id
      deployment_request {
        type
        status
      }
    }
  }
`;
