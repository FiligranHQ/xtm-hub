import { graphql } from 'react-relay';

export const trialsFragment = graphql`
  fragment trials_fragment on DeploymentRequest @inline {
    id
    region
    hub_status
    start_date
    end_date
    request_date
    requester_email
    organization_name
    ordering
    cancellation_date
    cancellation_user_email
    cancellation_reason
    platform_id
    platform_url
    organization_requester_id
    service_instance_id
  }
`;

export const trialsListFragment = graphql`
  fragment trialsList on Query
  @refetchable(queryName: "TrialsListPaginationQuery") {
    deploymentRequestsList(
      first: $count
      after: $cursor
      filters: $filters
      orderBy: $orderBy
      searchTerm: $searchTerm
      orderMode: $orderMode
    ) {
      __id
      totalCount
      edges {
        node {
          ...trials_fragment
        }
      }
    }
  }
`;

export const TrialsListQuery = graphql`
  query trialsListQuery(
    $count: Int!
    $cursor: ID
    $filters: [DeploymentRequestFilter!]
    $orderBy: DeploymentRequestOrdering!
    $orderMode: OrderingMode!
    $searchTerm: String
  ) {
    ...trialsList
  }
`;

export const TrialsReorderRequestInQueueMutation = graphql`
  mutation trialsReorderRequestInQueueMutation(
    $input: ReorderDeploymentRequestInQueueInput!
  ) {
    reorderDeploymentRequestInQueue(input: $input) {
      success
    }
  }
`;

export const TrialsAdminCancelDeploymentRequestMutation = graphql`
  mutation trialsAdminCancelDeploymentRequestMutation(
    $deploymentRequestId: DeploymentRequestId!
    $removeConnections: [ID!]!
  ) {
    adminCancelDeploymentRequest(deploymentRequestId: $deploymentRequestId) {
      id @deleteEdge(connections: $removeConnections)
    }
  }
`;

export const TrialsDeploymentAvailabilityFragment = graphql`
  fragment trialsDeploymentAvailabilityFragment on DeploymentAvailability
  @inline {
    region
    availableCount
    capacity
    platform_identifier
  }
`;

export const TrialsDeploymentRequestsAvailableListFragment = graphql`
  fragment trialsDeploymentRequestsAvailableList on Query
  @refetchable(queryName: "TrialsDeploymentRequestsAvailableListQuery") {
    deploymentRequestsAvailable(platformIdentifier: $platformIdentifier) {
      ...trialsDeploymentAvailabilityFragment
    }
  }
`;

export const TrialsDeploymentRequestsAvailableQuery = graphql`
  query trialsDeploymentRequestsAvailableQuery(
    $platformIdentifier: PlatformIdentifier!
  ) {
    ...trialsDeploymentRequestsAvailableList
  }
`;

export const TrialsUpdateDeploymentQuotaCapacityMutation = graphql`
  mutation trialsUpdateDeploymentQuotaCapacityMutation(
    $input: UpdateDeploymentQuotaCapacityInput!
  ) {
    updateDeploymentQuotaCapacity(input: $input) {
      success
    }
  }
`;
