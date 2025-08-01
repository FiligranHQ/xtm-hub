import { graphql } from 'react-relay';

export const IsOCTIPlatformRegisteredFragment = graphql`
  fragment enrollIsOCTIPlatformRegisteredFragment on IsOCTIPlatformRegisteredResponse {
    status
    organizationId
  }
`;

export const IsOCTIPlatformRegisteredQuery = graphql`
  query enrollIsOCTIPlatformRegisteredQuery(
    $input: IsOCTIPlatformRegisteredInput!
  ) {
    isOCTIPlatformRegistered(input: $input) {
      ...enrollIsOCTIPlatformRegisteredFragment
    }
  }
`;

export const CanUnenrollOCTIPlatformFragment = graphql`
  fragment enrollCanUnenrollOCTIPlatformFragment on CanUnenrollResponse {
    isPlatformEnrolled
    isAllowed
    isInOrganization
    organizationId
  }
`;

export const CanUnenrollOCTIPlatformQuery = graphql`
  query enrollCanUnenrollOCTIPlatformQuery(
    $input: CanUnenrollOCTIPlatformInput!
  ) {
    canUnenrollOCTIPlatform(input: $input) {
      ...enrollCanUnenrollOCTIPlatformFragment
    }
  }
`;

export const EnrollOCTIFragment = graphql`
  fragment enrollOCTIFragment on EnrollmentResponse {
    token
  }
`;

export const EnrollOCTIPlatform = graphql`
  mutation enrollOCTIPlatformMutation($input: EnrollOCTIPlatformInput!) {
    enrollOCTIPlatform(input: $input) {
      ...enrollOCTIFragment
    }
  }
`;

export const UnenrollOCTIFragment = graphql`
  fragment enrollUnenrollOCTIFragment on Success {
    success
  }
`;

export const UnenrollOCTIPlatform = graphql`
  mutation enrollUnenrollOCTIPlatformMutation(
    $input: UnenrollOCTIPlatformInput!
  ) {
    unenrollOCTIPlatform(input: $input) {
      ...enrollUnenrollOCTIFragment
    }
  }
`;

export const enrollOCTIPlatformFragment = graphql`
  fragment enrollOCTIPlatformFragment on OCTIPlatform {
    id
    platform_id
    title
    url
    contract
  }
`;

export const enrollOCTIPlatformListFragment = graphql`
  fragment enrollOCTIPlatformListFragment on Query
  @refetchable(queryName: "EnrollOCTIPlatformListQuery") {
    octiPlatforms {
      ...enrollOCTIPlatformFragment @relay(mask: false, plural: true)
    }
  }
`;

export const EnrollOCTIPlatformsQuery = graphql`
  query enrollOCTIPlatformsQuery {
    ...enrollOCTIPlatformListFragment
  }
`;
