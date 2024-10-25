import { graphql } from 'react-relay';

export const MeContextFragment = graphql`
  fragment meContext_fragment on User {
    id
    email
    capabilities {
      name
    }
    roles_portal_id {
      id
    }
    organizations {
      id
      name
      selected
    }
  }
`;

// Configuration or Preloader Query
export const MeQuery = graphql`
  query meLoaderQuery {
    me {
      ...meContext_fragment
    }
  }
`;
