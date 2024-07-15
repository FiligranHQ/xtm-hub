import { graphql } from 'react-relay';

export const usersFragment = graphql`
  fragment userList_users on Query
  @refetchable(queryName: "UsersPaginationQuery") {
    users(
      first: $count
      after: $cursor
      orderBy: $orderBy
      orderMode: $orderMode
    ) {
      __id
      totalCount
      edges {
        node {
          id
          email
          first_name
          last_name
          organization {
            name
          }
        }
      }
    }
  }
`;
export const UserListCreateMutation = graphql`
  mutation userListCreateMutation($input: AddUserInput!, $connections: [ID!]!) {
    addUser(input: $input)
      @prependNode(connections: $connections, edgeTypeName: "UserEdge") {
      email
      first_name
      last_name
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
    roles_portal_id {
      id
    }
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

// Configuration or Preloader Query
export const UserListQuery = graphql`
  query userQuery(
    $count: Int!
    $cursor: ID
    $orderBy: UserOrdering!
    $orderMode: OrderingMode!
  ) {
    ...userList_users
  }
`;

export const UserSlugQuery = graphql`
  query userSlugQuery($id: ID!) {
    user(id: $id) {
      ...userSlug_fragment
      tracking_data {
        ...trackingData_fragment
      }
    }
  }
`;
