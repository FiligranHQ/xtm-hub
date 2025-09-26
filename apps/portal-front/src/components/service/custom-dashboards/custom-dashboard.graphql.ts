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
      name
      ...customDashboardsItem_fragment
    }
  }
`;

export const CustomDashboardsUpdateMutation = graphql`
  mutation customDashboardsUpdateMutation(
    $documentId: ID!
    $input: UpdateCustomDashboardInput!
    $document: [Upload!]
    $updateDocument: Boolean!
    $images: [String!]
    $serviceInstanceId: String!
  ) {
    updateCustomDashboard(
      documentId: $documentId
      input: $input
      document: $document
      updateDocument: $updateDocument
      images: $images
      serviceInstanceId: $serviceInstanceId
    ) {
      __id
      ...customDashboardsItem_fragment
    }
  }
`;

export const CustomDashboardDeleteMutation = graphql`
  mutation customDashboardDeleteMutation(
    $documentId: ID!
    $connections: [ID!]!
    $serviceInstanceId: String!
  ) {
    deleteCustomDashboard(
      id: $documentId
      serviceInstanceId: $serviceInstanceId
    ) {
      id @deleteEdge(connections: $connections)
    }
  }
`;

export const customDashboardsItem = graphql`
  fragment customDashboardsItem_fragment on CustomDashboard @inline {
    id
    type
    uploader {
      first_name
      last_name
      email
      picture
    }
    uploader_organization {
      id
      name
      personal_space
    }
    service_instance_id
    name
    short_description
    description
    file_name
    minio_name
    active
    created_at
    updated_at
    updater_id
    download_number
    share_number
    children_documents {
      id
      file_name
    }
    slug
    service_instance {
      id
      slug
      name
    }
    subscription {
      id
    }
    labels {
      id
      name
      color
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
          ...documentBase_fragment
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

export const CustomDashboardQuery = graphql`
  query customDashboardQuery($documentId: ID, $serviceInstanceId: ID) {
    customDashboard(id: $documentId, serviceInstanceId: $serviceInstanceId) {
      ...customDashboardsItem_fragment
      ...documentBase_fragment
    }
  }
`;
