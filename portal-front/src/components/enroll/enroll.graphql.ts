import { graphql } from 'react-relay';

export const EnrollOCTIInstance = graphql`
  mutation enrollOCTIInstanceMutation($input: EnrollOCTIInstanceInput!) {
    enrollOCTIInstance(input: $input) {
      token
    }
  }
`;
