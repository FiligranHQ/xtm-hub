import { graphql } from 'react-relay';

export const CustomDashboardsCreateMutation = graphql`
  mutation customDashboardsCreateMutation(
    $input: CreateCustomDashboardInput!
    $document: [Upload!]!
    $serviceInstanceId: String!
    $connections: [ID!]!
  ) {
    createCustomDashboard(
      input: $input
      document: $document
      serviceInstanceId: $serviceInstanceId
    )
      @prependNode(
        connections: $connections
        edgeTypeName: "CustomDashboardEdge"
      ) {
      __id
      ...customDashboardsItem_fragment
    }
  }
`;

export const customDashboardsItem = graphql`
  fragment customDashboardsItem_fragment on CustomDashboard @inline {
    id
    type
    file_name
    created_at
    name
    short_description
    description
    download_number
    share_number
    active
    slug
    updated_at
    labels {
      id
      name
      color
    }
    uploader {
      first_name
      last_name
      picture
    }
    uploader_organization {
      id
      name
      personal_space
    }
    children_documents {
      id
    }
    service_instance {
      id
      slug
    }
    subscription {
      id
    }
    # Specific fields
    product_version
  }
`;

export const customDashboardsFragment = graphql`
  fragment customDashboardsList on Query
  @refetchable(queryName: "CustomDashboardsPaginationQuery") {
    customDashboards(
      first: $count
      after: $cursor
      orderBy: $orderBy
      orderMode: $orderMode
      searchTerm: $searchTerm
      filters: $filters
      serviceInstanceId: $serviceInstanceId
    ) {
      __id
      totalCount
      edges {
        node {
          ...customDashboardsItem_fragment
        }
      }
    }
  }
`;

export const CustomDashboardsListQuery = graphql`
  query customDashboardsQuery(
    $count: Int!
    $cursor: ID
    $orderBy: DocumentOrdering!
    $orderMode: OrderingMode!
    $filters: [Filter!]
    $searchTerm: String
    $serviceInstanceId: String
  ) {
    ...customDashboardsList
  }
`;
