import { graphql } from 'react-relay';

export const MeContextFragment = graphql`
  fragment meContext_fragment on User {
    id
    email
    first_name
    last_name
    picture
    selected_organization_id @required(action: THROW)
    capabilities @required(action: THROW) {
      name
    }
    roles_portal @required(action: THROW) {
      id
    }
    organizations @required(action: THROW) {
      id
      name
      personal_space
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

export const meUserHasOrganizationWithSubscription = graphql`
  query meUserHasOrganizationWithSubscription {
    userHasOrganizationWithSubscription
  }
`;
