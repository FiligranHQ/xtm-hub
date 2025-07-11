import { graphql } from 'react-relay';

export const SeoServiceInstanceFragment = graphql`
  fragment seoServiceInstanceFragment on SeoServiceInstance {
    id
    name
    slug
    description
    logo_document_id
    illustration_document_id
    service_definition {
      identifier
    }
    tags
    links {
      url
      name
    }
  }
`;

export const SeoServiceInstancesQuery = graphql`
  query seoServiceInstancesQuery {
    seoServiceInstances {
      ...seoServiceInstanceFragment
    }
  }
`;

export const SeoServiceInstanceQuery = graphql`
  query seoServiceInstanceQuery($slug: String!) {
    seoServiceInstance(slug: $slug) {
      ...seoServiceInstanceFragment
    }
  }
`;
