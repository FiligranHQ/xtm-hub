import { graphql } from 'react-relay';

export const SeoIntegrationFragment = graphql`
  fragment seoIntegrationFragment on Integration {
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

    ... on Connector {
      integration_subtype
    }
    ... on Stream {
      integration_subtype
    }
    ... on TaxiiFeed {
      integration_subtype
    }
  }
`;

export const SeoIntegrationConnectorFragment = graphql`
  fragment seoIntegrationConnectorFragment on Connector {
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

export const seoIntegrationsByServiceSlugQuery = graphql`
  query seoIntegrationsByServiceSlugQuery($serviceSlug: String!) {
    publicIntegrationsByServiceSlug(serviceSlug: $serviceSlug) {
      ...seoIntegrationFragment
      ...seoIntegrationConnectorFragment
    }
  }
`;
export const SeoIntegrationBySlugQuery = graphql`
  query seoIntegrationBySlugQuery($slug: String!) {
    publicIntegrationBySlug(slug: $slug) {
      ...seoIntegrationFragment
      ...seoIntegrationConnectorFragment
    }
  }
`;

export const seoIntegrationsItem = graphql`
  fragment seoIntegrationsItemFragment on Integration @inline {
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

    ...seoIntegrationConnectorFragment @relay(mask: false)
  }
`;

export const seoIntegrationsFragment = graphql`
  fragment seoIntegrationsList on Query
  @refetchable(queryName: "SeoIntegrationsPaginationQuery") {
    publicIntegrations(
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
          ...seoIntegrationsItemFragment
        }
      }
    }
  }
`;

export const SeoIntegrationListQuery = graphql`
  query seoIntegrationsQuery(
    $slug: String!
    $count: Int!
    $cursor: ID
    $orderBy: DocumentOrdering!
    $orderMode: OrderingMode!
    $filters: [Filter!]
    $searchTerm: String
    $serviceInstanceId: String
  ) {
    ...seoIntegrationsList
  }
`;
