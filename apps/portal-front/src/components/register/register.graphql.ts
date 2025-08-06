import { graphql } from 'react-relay';

export const IsOCTIPlatformRegisteredFragment = graphql`
  fragment enrollIsOCTIPlatformRegisteredFragment on IsOCTIPlatformRegisteredResponse {
    status
    organization {
      id
    }
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

export const CanUnregisterOCTIPlatformFragment = graphql`
  fragment enrollCanUnregisterOCTIPlatformFragment on CanUnregisterResponse {
    isPlatformEnrolled
    isAllowed
    isInOrganization
    organizationId
  }
`;

export const CanUnregisterOCTIPlatformQuery = graphql`
  query enrollCanUnregisterOCTIPlatformQuery(
    $input: CanUnregisterOCTIPlatformInput!
  ) {
    canUnregisterOCTIPlatform(input: $input) {
      ...enrollCanUnregisterOCTIPlatformFragment
    }
  }
`;

export const EnrollOCTIFragment = graphql`
  fragment enrollOCTIFragment on RegistrationResponse {
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

export const UnregisterOCTIFragment = graphql`
  fragment enrollUnregisterOCTIFragment on Success {
    success
  }
`;

export const UnregisterOCTIPlatform = graphql`
  mutation enrollUnregisterOCTIPlatformMutation(
    $input: UnregisterOCTIPlatformInput!
  ) {
    unregisterOCTIPlatform(input: $input) {
      ...enrollUnregisterOCTIFragment
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
