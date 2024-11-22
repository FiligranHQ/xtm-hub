import { graphql } from 'react-relay';

export const UserListCreateMutation = graphql`
  mutation userListCreateMutation($input: AddUserInput!, $connections: [ID!]!) {
    addUser(input: $input)
      @prependNode(connections: $connections, edgeTypeName: "UserEdge") {
      ...userSlug_fragment
    }
  }
`;

export const UserSlugEditMutation = graphql`
  mutation userSlugEditMutation($id: ID!, $input: EditUserInput!) {
    editUser(id: $id, input: $input) {
      ...userSlug_fragment
    }
  }
`;

export const userSlugDeletion = graphql`
  mutation userSlugDeletionMutation($id: ID!) {
    deleteUser(id: $id) {
      id
    }
  }
`;

export const userDeletion = graphql`
  mutation userDeletionMutation($connections: [ID!]!, $id: ID!) {
    deleteUser(id: $id) {
      id @deleteEdge(connections: $connections)
    }
  }
`;

export const userSlugFragment = graphql`
  fragment userSlug_fragment on User {
    id
    email
    last_name
    first_name
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
        ...userSlug_fragment
      }
      delete {
        id @deleteRecord
      }
    }
  }
`;

export const UserSlugQuery = graphql`
  query userSlugQuery($id: ID!) {
    user(id: $id) {
      ...userSlug_fragment
    }
  }
`;
