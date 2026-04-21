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
    platformTitle
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

export const UnregisterFragment = graphql`
  fragment registerUnregisterFragment on Success {
    success
  }
`;

export const UnregisterPlatform = graphql`
  mutation registerUnregisterPlatformMutation(
    $input: UnregisterPlatformInput!
  ) {
    unregisterPlatform(input: $input) {
      ...registerUnregisterFragment
    }
  }
`;

export const registeredPlatformByServiceInstanceId = graphql`
  query registeredPlatformByServiceInstanceIdQuery(
    $input: RegisteredPlatformInput!
  ) {
    registeredPlatform(input: $input) {
      platform_id
      title
      contract
      ...registeredPlatformByServiceInstanceId_fragment
    }
  }
`;

export const registeredPlatformByServiceInstanceIdFragment = graphql`
  fragment registeredPlatformByServiceInstanceId_fragment on RegisteredPlatform {
    id
    platform_id
    tenant_id
    title
    contract
    url
    identifier
    subscription {
      start_date
      end_date
      service_instance {
        id
      }
      organization {
        id
      }
    }
    deployment_request {
      id
      hub_status
      region
      counts_in_orga_quota
      platform_identifier
    }
  }
`;

export const registerRegisteredPlatformFragment = graphql`
  fragment registerRegisteredPlatformFragment on RegisteredPlatform {
    id
    platform_id
    tenant_id
    title
    url
    contract
    identifier
    illustration_document_id
    deployment_request {
      id
      type
      activity_sector
      job_title
      hub_status
      counts_in_orga_quota
    }
    subscription {
      status
      end_date
      start_date
      service_instance {
        id
        creation_status
        name
      }
    }
  }
`;

export const registerRegisteredPlatformListFragment = graphql`
  fragment registerRegisteredPlatformListFragment on Query
  @refetchable(queryName: "RegisterRegisteredPlatformListQuery") {
    registeredPlatforms(input: $input) {
      ...registerRegisteredPlatformFragment @relay(mask: false, plural: true)
    }
  }
`;

export const RegisterRegisteredPlatformsQuery = graphql`
  query registerRegisteredPlatformsQuery($input: RegisteredPlatformsInput) {
    ...registerRegisteredPlatformListFragment
  }
`;
