import { graphql } from 'react-relay';

export const SeoCsvFeedFragment = graphql`
  fragment seoCsvFeedFragment on CsvFeed {
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
  }
`;

export const SeoCsvFeedsByServiceSlugQuery = graphql`
  query seoCsvFeedsByServiceSlugQuery($serviceSlug: String!) {
    seoCsvFeedsByServiceSlug(serviceSlug: $serviceSlug) {
      ...seoCsvFeedFragment
    }
  }
`;
export const SeoCsvFeedBySlugQuery = graphql`
  query seoCsvFeedBySlugQuery($slug: String!) {
    seoCsvFeedBySlug(slug: $slug) {
      ...seoCsvFeedFragment
    }
  }
`;
