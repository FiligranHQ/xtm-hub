import { graphql } from 'react-relay';

export const SeoIntegrationFeedFragment = graphql`
  fragment seoIntegrationFeedFragment on Integrations {
    __typename
    id
    name
    description
    short_description
    created_at
    updated_at
    slug
    download_number
    share_number
    children_documents {
      id
    }
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
    active
    type
    integration_type
  }
`;

export const SeoIntegrationFeedConnectorFragment = graphql`
  fragment seoIntegrationFeedConnectorFragment on Connector {
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

export const seoIntegrationFeedByServiceSlugQuery = graphql`
  query seoIntegrationFeedByServiceSlugQuery($serviceSlug: String!) {
    publicIntegrationFeedByServiceSlug(serviceSlug: $serviceSlug) {
      ...seoIntegrationFeedFragment
      ...seoIntegrationFeedConnectorFragment
    }
  }
`;
export const SeoIntegrationFeedBySlugQuery = graphql`
  query seoIntegrationFeedBySlugQuery($slug: String!) {
    publicIntegrationFeedBySlug(slug: $slug) {
      ...seoIntegrationFeedFragment
      ...seoIntegrationFeedConnectorFragment
    }
  }
`;

export const seoIntegrationFeedsItem = graphql`
  fragment seoIntegrationFeedsItemFragment on Integrations @inline {
    __typename
    id
    name
    description
    short_description
    created_at
    updated_at
    slug
    download_number
    share_number
    service_instance {
      id
      slug
    }
    children_documents {
      id
    }
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
    active
    type
    integration_type

    ...seoIntegrationFeedConnectorFragment @relay(mask: false)
  }
`;

export const seoIntegrationFeedsFragment = graphql`
  fragment seoIntegrationFeedsList on Query
  @refetchable(queryName: "SeoIntegrationFeedsPaginationQuery") {
    publicIntegrationFeeds(
      slug: $slug
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
          ...seoIntegrationFeedsItemFragment
        }
      }
    }
  }
`;

export const SeoIntegrationFeedListQuery = graphql`
  query seoIntegrationFeedsQuery(
    $slug: String!
    $count: Int!
    $cursor: ID
    $orderBy: DocumentOrdering!
    $orderMode: OrderingMode!
    $filters: [Filter!]
    $searchTerm: String
    $serviceInstanceId: String
  ) {
    ...seoIntegrationFeedsList
  }
`;
