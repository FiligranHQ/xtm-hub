import { graphql } from 'react-relay';

export const SeoOpenAEVScenarioFragment = graphql`
  fragment seoOpenAEVScenarioFragment on OpenAEVScenario {
    id
    name
    description
    short_description
    product_version
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
  }
`;

export const SeoOpenAEVScenariosByServiceSlugQuery = graphql`
  query seoOpenAEVScenariosByServiceSlugQuery($serviceSlug: String!) {
    seoOpenAEVScenariosByServiceSlug(serviceSlug: $serviceSlug) {
      ...seoOpenAEVScenarioFragment
    }
  }
`;

export const SeoOpenAEVScenarioBySlugQuery = graphql`
  query seoOpenAEVScenarioBySlugQuery($slug: String!) {
    seoOpenAEVScenarioBySlug(slug: $slug) {
      ...seoOpenAEVScenarioFragment
    }
  }
`;
