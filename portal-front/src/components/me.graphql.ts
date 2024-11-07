import { graphql } from 'react-relay';

export const MeContextFragment = graphql`
  fragment meContext_fragment on User {
    id
    email
    first_name
    last_name
    capabilities @required(action: THROW) {
      name
    }
    roles_portal @required(action: THROW) {
      id
    }
    organizations @required(action: THROW) {
      id
      name
      selected @required(action: THROW)
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
