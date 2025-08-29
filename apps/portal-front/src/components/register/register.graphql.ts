import { graphql } from 'react-relay';

export const RefreshUserPlatformTokenMutation = graphql`
  mutation registerRefreshUserPlatformTokenMutation {
    refreshUserPlatformToken {
      token
    }
  }
`;

export const IsOpenCTIPlatformRegisteredFragment = graphql`
  fragment registerIsOpenCTIPlatformRegisteredFragment on IsOpenCTIPlatformRegisteredResponse {
    status
    platformTitle
    organization {
      id
    }
  }
`;

export const IsOpenCTIPlatformRegisteredQuery = graphql`
  query registerIsOpenCTIPlatformRegisteredQuery(
    $input: IsOpenCTIPlatformRegisteredInput!
  ) {
    isOpenCTIPlatformRegistered(input: $input) {
      ...registerIsOpenCTIPlatformRegisteredFragment
    }
  }
`;

export const CanUnregisterOpenCTIPlatformFragment = graphql`
  fragment registerCanUnregisterOpenCTIPlatformFragment on CanUnregisterResponse {
    isPlatformRegistered
    isAllowed
    isInOrganization
    organizationId
  }
`;

export const CanUnregisterOpenCTIPlatformQuery = graphql`
  query registerCanUnregisterOpenCTIPlatformQuery(
    $input: CanUnregisterOpenCTIPlatformInput!
  ) {
    canUnregisterOpenCTIPlatform(input: $input) {
      ...registerCanUnregisterOpenCTIPlatformFragment
    }
  }
`;

export const RegisterOpenCTIFragment = graphql`
  fragment registerOpenCTIFragment on RegistrationResponse {
    token
  }
`;

export const RegisterOpenCTIPlatform = graphql`
  mutation registerOpenCTIPlatformMutation(
    $input: RegisterOpenCTIPlatformInput!
  ) {
    registerOpenCTIPlatform(input: $input) {
      ...registerOpenCTIFragment
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
