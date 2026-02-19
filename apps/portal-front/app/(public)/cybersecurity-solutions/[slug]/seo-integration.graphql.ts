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
    use_cases {
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

    ... on CsvFeed {
      feed_url
    }
    ... on Connector {
      integration_subtype
    }
    ... on Stream {
      integration_subtype
      feed_url
    }
    ... on TaxiiFeed {
      integration_subtype
      feed_url
    }
    ... on ThirdPartyIntegration {
      integration_subtype
      product_version
      github_url
      vendor_url
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
