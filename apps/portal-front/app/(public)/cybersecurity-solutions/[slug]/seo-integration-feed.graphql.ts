import { graphql } from 'react-relay';

export const SeoIntegrationFeedFragment = graphql`
  fragment seoIntegrationFeedFragment on IntegrationFeed {
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
