import { graphql } from 'react-relay';

export const SeoServiceInstanceFragment = graphql`
  fragment seoCustomDashboardFragment on SeoCustomDashboard {
    id
    name
    description
    short_description
    product_version
    created_at
    updated_at
    slug
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
  }
`;

export const SeoCustomDashboardsByServiceSlugQuery = graphql`
  query seoCustomDashboardsByServiceSlugQuery($serviceSlug: String!) {
    seoCustomDashboardsByServiceSlug(serviceSlug: $serviceSlug) {
      ...seoCustomDashboardFragment
    }
  }
`;
