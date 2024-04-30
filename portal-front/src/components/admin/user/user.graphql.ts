import { graphql } from 'react-relay';

export const UserListCreateMutation = graphql`
  mutation userListCreateMutation($input: AddUserInput!, $connections: [ID!]!) {
    addUser(input: $input)
      @prependNode(connections: $connections, edgeTypeName: "UsersEdge") {
      email
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

export const userSlugFragment = graphql`
  fragment userSlug_fragment on User {
    id
    email
    last_name
    first_name
    organization {
      id
      name
    }
  }
`;

export const userActionTrackingFragment = graphql`
  fragment userActionTracking_fragment on ActionTracking {
    id
    contextual_id
    created_at
    ended_at
    status
    message_tracking {
      ...userMessageTracking_fragment
    }
  }
`;

export const userMessageTrackingFragment = graphql`
  fragment userMessageTracking_fragment on MessageTracking {
    id
    created_at
    type
    technical
    tracking_info
  }
`;

export const userSlugSubscription = graphql`
  subscription userSlugSubscription {
    User {
      edit {
        ...userSlug_fragment
      }
      merge {
        from
        target
      }
      delete {
        id @deleteRecord
      }
    }
  }
`;
