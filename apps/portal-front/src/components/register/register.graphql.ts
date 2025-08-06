import { graphql } from 'react-relay';

export const IsOCTIPlatformRegisteredFragment = graphql`
  fragment registerIsOCTIPlatformRegisteredFragment on IsOCTIPlatformRegisteredResponse {
    status
    organization {
      id
    }
  }
`;

export const IsOCTIPlatformRegisteredQuery = graphql`
  query registerIsOCTIPlatformRegisteredQuery(
    $input: IsOCTIPlatformRegisteredInput!
  ) {
    isOCTIPlatformRegistered(input: $input) {
      ...registerIsOCTIPlatformRegisteredFragment
    }
  }
`;

export const CanUnregisterOCTIPlatformFragment = graphql`
  fragment registerCanUnregisterOCTIPlatformFragment on CanUnregisterResponse {
    isPlatformRegistered
    isAllowed
    isInOrganization
    organizationId
  }
`;

export const CanUnregisterOCTIPlatformQuery = graphql`
  query registerCanUnregisterOCTIPlatformQuery(
    $input: CanUnregisterOCTIPlatformInput!
  ) {
    canUnregisterOCTIPlatform(input: $input) {
      ...registerCanUnregisterOCTIPlatformFragment
    }
  }
`;

export const RegisterOCTIFragment = graphql`
  fragment registerOCTIFragment on RegistrationResponse {
    token
  }
`;

export const RegisterOCTIPlatform = graphql`
  mutation registerOCTIPlatformMutation($input: RegisterOCTIPlatformInput!) {
    registerOCTIPlatform(input: $input) {
      ...registerOCTIFragment
    }
  }
`;

export const UnregisterOCTIFragment = graphql`
  fragment registerUnregisterOCTIFragment on Success {
    success
  }
`;

export const UnregisterOCTIPlatform = graphql`
  mutation registerUnregisterOCTIPlatformMutation(
    $input: UnregisterOCTIPlatformInput!
  ) {
    unregisterOCTIPlatform(input: $input) {
      ...registerUnregisterOCTIFragment
    }
  }
`;

export const registerOCTIPlatformFragment = graphql`
  fragment registerOCTIPlatformFragment on OCTIPlatform {
    id
    platform_id
    title
    url
    contract
  }
`;

export const registerOCTIPlatformListFragment = graphql`
  fragment registerOCTIPlatformListFragment on Query
  @refetchable(queryName: "RegisterOCTIPlatformListQuery") {
    octiPlatforms {
      ...registerOCTIPlatformFragment @relay(mask: false, plural: true)
    }
  }
`;

export const RegisterOCTIPlatformsQuery = graphql`
  query registerOCTIPlatformsQuery {
    ...registerOCTIPlatformListFragment
  }
`;
