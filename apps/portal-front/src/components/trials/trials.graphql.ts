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
    $deploymentRequestId: ID!
    $removeConnections: [ID!]!
  ) {
    adminCancelDeploymentRequest(deploymentRequestId: $deploymentRequestId) {
      id @deleteEdge(connections: $removeConnections)
    }
  }
`;
