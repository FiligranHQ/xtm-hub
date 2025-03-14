import { graphql } from 'react-relay';

export const SeoServiceInstanceFragment = graphql`
  fragment seoCustomDashboardFragment on SeoCustomDashboard {
    id
    name
    description
    slug
    images {
      id
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
