import { graphql } from 'react-relay';

export const CsvFeedCreateMutation = graphql`
  mutation csvFeedCreateMutation(
    $input: CsvFeedCreateInput!
    $document: Upload
    $serviceInstanceId: String
    $connections: [ID!]!
  ) {
    createCsvFeed(
      input: $input
      document: $document
      serviceInstanceId: $serviceInstanceId
    ) @prependNode(connections: $connections, edgeTypeName: "DocumentEdge") {
      __id
      id
      name
      file_name
      created_at
      active
      short_description
      uploader {
        first_name
        last_name
        picture
      }
      labels {
        id
        name
        color
      }
      children_documents {
        id
        file_name
        created_at
        name
        description
        download_number
        active
      }
      uploader_organization {
        id
        name
        personal_space
      }
    }
  }
`;

export const CsvFeedDeleteMutation = graphql`
  mutation csvFeedDeleteMutation(
    $documentId: ID!
    $connections: [ID!]!
    $serviceInstanceId: String!
    $forceDelete: Boolean
  ) {
    deleteCsvFeed(
      documentId: $documentId
      service_instance_id: $serviceInstanceId
      forceDelete: $forceDelete
    ) {
      id @deleteEdge(connections: $connections)
      success
    }
  }
`;

export const csvFeedItem = graphql`
  fragment csvFeedItem_fragment on CsvFeed @inline {
    id
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
      file_name
      created_at
      name
      description
      download_number
      active
    }
    service_instance {
      id
      slug
    }
    subscription {
      id
    }
  }
`;

export const csvFeedsFragment = graphql`
  fragment csvFeedsList on Query
  @refetchable(queryName: "CsvFeedsPaginationQuery") {
    csvFeeds(
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
          id
          active
          ...csvFeedItem_fragment
        }
      }
    }
  }
`;

export const CsvFeedsListQuery = graphql`
  query csvFeedsQuery(
    $count: Int!
    $cursor: ID
    $orderBy: DocumentOrdering!
    $orderMode: OrderingMode!
    $filters: [Filter!]
    $searchTerm: String
    $serviceInstanceId: String
  ) {
    ...csvFeedsList
  }
`;

export const CsvFeedQuery = graphql`
  query csvFeedQuery($documentId: ID, $serviceInstanceId: ID) {
    csvFeed(documentId: $documentId, serviceInstanceId: $serviceInstanceId) {
      ...csvFeedItem_fragment
    }
  }
`;
