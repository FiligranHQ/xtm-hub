import { graphql } from 'react-relay';

export const UserListCreateMutation = graphql`
  mutation userListCreateMutation($input: AddUserInput!, $connections: [ID!]!) {
    addUser(input: $input)
      @prependNode(connections: $connections, edgeTypeName: "UserEdge") {
      ...userList_fragment
    }
  }
`;

export const UserSlugEditMutation = graphql`
  mutation userSlugEditMutation($id: ID!, $input: EditUserInput!) {
    editUser(id: $id, input: $input) {
      ...userList_fragment
    }
  }
`;

export const UserMeEditMutation = graphql`
  mutation userMeEditMutation($input: EditMeUserInput!) {
    editMeUser(input: $input) {
      ...userList_fragment
    }
  }
`;

export const userSlugFragment = graphql`
  fragment userSlug_fragment on User {
    id
    email
    last_name
    first_name
    disabled
    organizations @required(action: THROW) {
      id
      name
      personal_space
    }
    roles_portal @required(action: THROW) {
      id
      name
    }
  }
`;

export const userSlugSubscription = graphql`
  subscription userSlugSubscription {
    User {
      edit {
        ...userList_fragment
      }
      delete {
        id @deleteRecord
      }
    }
  }
`;

export const userMeSubscription = graphql`
  subscription userMeSubscription {
    MeUser {
      delete {
        id
      }
      edit {
        ...meContext_fragment @relay(mask: false)
      }
    }
  }
`;

export const UserSlugQuery = graphql`
  query userSlugQuery($id: ID!) {
    user(id: $id) {
      ...userList_fragment
    }
  }
`;
