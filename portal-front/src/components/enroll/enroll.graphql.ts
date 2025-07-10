import { graphql } from 'react-relay';

export const CanEnrollOCTIInstanceQuery = graphql`
  query enrollCanEnrollOCTIInstanceQuery(
    $input: CanEnrollOCTIInstanceInput!
    $skip: Boolean!
  ) {
    canEnrollOCTIInstance(input: $input) @skip(if: $skip) {
      status
      isAllowed
      isSameOrganization
    }
  }
`;

export const EnrollOCTIInstance = graphql`
  mutation enrollOCTIInstanceMutation($input: EnrollOCTIInstanceInput!) {
    enrollOCTIInstance(input: $input) {
      token
    }
  }
`;
