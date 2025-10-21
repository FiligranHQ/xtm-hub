import { graphql } from 'react-relay';

export const integrationFeedsItem = graphql`
  fragment integrationFeedsItem_fragment on IntegrationFeed @inline {
    __typename
    id
    active
    type
    file_name
    created_at
    name
    short_description
    description
    download_number
    share_number
    slug
    updated_at
    labels {
      id
      name
      color
    }
    uploader {
      id
      email
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
    }
    service_instance {
      id
      slug
    }
    subscription {
      id
    }
    integration_type

    ...integrationFeedConnectorsItem_fragment
  }
`;

export const connectorsItem = graphql`
  fragment integrationFeedConnectorsItem_fragment on Connector {
    verified
    product_version
    container_image
    source_code
    subscription_link
    integration_subtype
    manager_supported
    playbook_supported
  }
`;

export const integrationFeedsFragment = graphql`
  fragment integrationFeedsList on Query
  @refetchable(queryName: "IntegrationFeedsPaginationQuery") {
    integrationFeeds(
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
          ...integrationFeedsItem_fragment
        }
      }
    }
  }
`;

export const IntegrationFeedsListQuery = graphql`
  query integrationFeedsQuery(
    $count: Int!
    $cursor: ID
    $orderBy: DocumentOrdering!
    $orderMode: OrderingMode!
    $filters: [Filter!]
    $searchTerm: String
    $serviceInstanceId: String
  ) {
    ...integrationFeedsList
  }
`;

export const IntegrationFeedQuery = graphql`
  query integrationFeedQuery($documentId: ID, $serviceInstanceId: ID) {
    integrationFeed(id: $documentId, serviceInstanceId: $serviceInstanceId) {
      ...integrationFeedsItem_fragment
    }
  }
`;
