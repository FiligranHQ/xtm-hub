import { graphql } from 'react-relay';

export const SeoServiceInstanceFragment = graphql`
  fragment seoCustomDashboardFragment on CustomDashboard {
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
  }
`;

export const SeoCustomDashboardsByServiceSlugQuery = graphql`
  query seoCustomDashboardsByServiceSlugQuery($serviceSlug: String!) {
    seoCustomDashboardsByServiceSlug(serviceSlug: $serviceSlug) {
      ...seoCustomDashboardFragment
    }
  }
`;
