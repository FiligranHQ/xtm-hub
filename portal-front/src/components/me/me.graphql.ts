import { graphql } from 'react-relay';

export const MeContextFragment = graphql`
  fragment meContext_fragment on User {
    id
    email
    first_name
    last_name
    country
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
    selected_org_capabilities
  }
`;

export const MeResetPasswordMutation = graphql`
  mutation meResetPasswordMutation {
    resetPassword
  }
`;

export const MeEditUserMutation = graphql`
  mutation meEditUserMutation(
    $first_name: String
    $last_name: String
    $country: String
    $picture: String
  ) {
    editMeUser(
      input: {
        first_name: $first_name
        last_name: $last_name
        country: $country
        picture: $picture
      }
    ) {
      ...meContext_fragment
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
