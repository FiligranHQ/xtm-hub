import { graphql } from 'react-relay';

export const SeoObasScenarioFragment = graphql`
  fragment seoObasScenarioFragment on OpenAEVScenario {
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

export const SeoObasScenariosByServiceSlugQuery = graphql`
  query seoObasScenariosByServiceSlugQuery($serviceSlug: String!) {
    seoOpenAEVScenariosByServiceSlug(serviceSlug: $serviceSlug) {
      ...seoObasScenarioFragment
    }
  }
`;

export const SeoObasScenarioBySlugQuery = graphql`
  query seoObasScenarioBySlugQuery($slug: String!) {
    seoOpenAEVScenarioBySlug(slug: $slug) {
      ...seoObasScenarioFragment
    }
  }
`;
