import { graphql } from 'react-relay';

export const RefreshUserPlatformTokenMutation = graphql`
  mutation registerRefreshUserPlatformTokenMutation {
    refreshUserPlatformToken {
      token
    }
  }
`;

export const IsPlatformRegisteredFragment = graphql`
  fragment registerIsPlatformRegisteredFragment on IsPlatformRegisteredResponse {
    status
    organization {
      id
    }
  }
`;

export const IsPlatformRegisteredQuery = graphql`
  query registerIsPlatformRegisteredQuery($input: IsPlatformRegisteredInput!) {
    isPlatformRegistered(input: $input) {
      ...registerIsPlatformRegisteredFragment
    }
  }
`;

export const CanUnregisterPlatformFragment = graphql`
  fragment registerCanUnregisterPlatformFragment on CanUnregisterResponse {
    isPlatformRegistered
    isAllowed
    isInOrganization
    organizationId
  }
`;

export const CanUnregisterPlatformQuery = graphql`
  query registerCanUnregisterPlatformQuery(
    $input: CanUnregisterPlatformInput!
  ) {
    canUnregisterPlatform(input: $input) {
      ...registerCanUnregisterPlatformFragment
    }
  }
`;

export const RegisterFragment = graphql`
  fragment registerFragment on RegistrationResponse {
    token
  }
`;

export const RegisterPlatform = graphql`
  mutation registerPlatformMutation($input: RegisterPlatformInput!) {
    registerPlatform(input: $input) {
      ...registerFragment
    }
  }
`;

export const UnregisterOpenCTIFragment = graphql`
  fragment registerUnregisterOpenCTIFragment on Success {
    success
  }
`;

export const UnregisterOpenCTIPlatform = graphql`
  mutation registerUnregisterOpenCTIPlatformMutation(
    $input: UnregisterOpenCTIPlatformInput!
  ) {
    unregisterOpenCTIPlatform(input: $input) {
      ...registerUnregisterOpenCTIFragment
    }
  }
`;

export const registerOpenCTIPlatformFragment = graphql`
  fragment registerOpenCTIPlatformFragment on OpenCTIPlatform {
    id
    platform_id
    title
    url
    contract
  }
`;

export const registerOpenCTIPlatformListFragment = graphql`
  fragment registerOpenCTIPlatformListFragment on Query
  @refetchable(queryName: "RegisterOpenCTIPlatformListQuery") {
    openCTIPlatforms {
      ...registerOpenCTIPlatformFragment @relay(mask: false, plural: true)
    }
  }
`;

export const RegisterOpenCTIPlatformsQuery = graphql`
  query registerOpenCTIPlatformsQuery {
    ...registerOpenCTIPlatformListFragment
  }
`;
