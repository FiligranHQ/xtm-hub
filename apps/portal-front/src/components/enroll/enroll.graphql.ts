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

export const enrollOCTIInstanceFragment = graphql`
  fragment enrollOCTIInstanceFragment on OctiInstance {
    id
    platform_id
    title
    url
    contract
  }
`;

export const enrollOCTIInstanceListFragment = graphql`
  fragment enrollOCTIInstanceListFragment on Query
  @refetchable(queryName: "EnrollOCTIInstanceListQuery") {
    octiInstances {
      ...enrollOCTIInstanceFragment @relay(mask: false, plural: true)
    }
  }
`;

export const EnrollOCTIInstancesQuery = graphql`
  query enrollOCTIInstancesQuery {
    ...enrollOCTIInstanceListFragment
  }
`;
