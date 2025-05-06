import { graphql } from 'react-relay';

export const CsvFeedsCreateMutation = graphql`
  mutation csvFeedsCreateMutation(
    $input: CreateCsvFeedInput!
    $document: Upload!
    $serviceInstanceId: String!
    $connections: [ID!]!
  ) {
    createCsvFeed(
      input: $input
      document: $document
      serviceInstanceId: $serviceInstanceId
    ) @prependNode(connections: $connections, edgeTypeName: "DocumentEdge") {
      __id
      ...csvFeedsItem_fragment
    }
  }
`;

export const csvFeedsItem = graphql`
  fragment csvFeedsItem_fragment on CsvFeed @inline {
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
          ...csvFeedsItem_fragment
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
