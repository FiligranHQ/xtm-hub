import { graphql } from 'react-relay';

export const SeoOpenaevScenarioFragment = graphql`
  fragment seoOpenaevScenarioFragment on OpenAEVScenario {
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

export const SeoOpenaevScenariosByServiceSlugQuery = graphql`
  query seoOpenaevScenariosByServiceSlugQuery($serviceSlug: String!) {
    seoOpenAEVScenariosByServiceSlug(serviceSlug: $serviceSlug) {
      ...seoOpenaevScenarioFragment
    }
  }
`;

export const SeoOpenaevScenarioBySlugQuery = graphql`
  query seoOpenaevScenarioBySlugQuery($slug: String!) {
    seoOpenAEVScenarioBySlug(slug: $slug) {
      ...seoOpenaevScenarioFragment
    }
  }
`;
