import { graphql } from 'react-relay';

export const CanEnrollOCTIInstanceFragment = graphql`
  fragment enrollCanEnrollOCTIInstanceFragment on CanEnrollResponse {
    status
    isAllowed
    isSameOrganization
  }
`;
export const CanEnrollOCTIInstanceQuery = graphql`
  query enrollCanEnrollOCTIInstanceQuery(
    $input: CanEnrollOCTIInstanceInput!
    $skip: Boolean!
  ) {
    canEnrollOCTIInstance(input: $input) @skip(if: $skip) {
      ...enrollCanEnrollOCTIInstanceFragment
    }
  }
`;

export const EnrollOCTIFragment = graphql`
  fragment enrollOCTIFragment on EnrollmentResponse {
    token
  }
`;

export const EnrollOCTIInstance = graphql`
  mutation enrollOCTIInstanceMutation($input: EnrollOCTIInstanceInput!) {
    enrollOCTIInstance(input: $input) {
      ...enrollOCTIFragment
    }
  }
`;
