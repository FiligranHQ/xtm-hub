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

export const CanUnenrollOCTIInstanceFragment = graphql`
  fragment enrollCanUnenrollOCTIInstanceFragment on CanUnenrollResponse {
    isAllowed
    organizationId
  }
`;

export const CanUnenrollOCTIInstanceQuery = graphql`
  query enrollCanUnenrollOCTIInstanceQuery(
    $input: CanUnenrollOCTIInstanceInput!
  ) {
    canUnenrollOCTIInstance(input: $input) {
      ...enrollCanUnenrollOCTIInstanceFragment
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

export const UnenrollOCTIFragment = graphql`
  fragment enrollUnenrollOCTIFragment on Success {
    success
  }
`;

export const UnenrollOCTIInstance = graphql`
  mutation enrollUnenrollOCTIInstanceMutation(
    $input: UnenrollOCTIInstanceInput!
  ) {
    unenrollOCTIInstance(input: $input) {
      ...enrollUnenrollOCTIFragment
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
