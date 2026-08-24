import { graphql } from 'react-relay';

export const AcceptPendingUserMutation = graphql`
  mutation PendingUserListAcceptUserMutation(
    $user_id: UserId!
    $organization_id: OrganizationId!
  ) {
    acceptPendingUserInOrganization(
      user_id: $user_id
      organization_id: $organization_id
    ) {
      ...UserList_fragment
    }
  }
`;

export const RemovePendingUserMutation = graphql`
  mutation PendingUserListRemoveUserMutation(
    $user_id: UserId!
    $organization_id: OrganizationId!
  ) {
    removePendingUserFromOrganization(
      user_id: $user_id
      organization_id: $organization_id
    ) {
      ...UserList_fragment
    }
  }
`;

export const RemovePendingUserBulkMutation = graphql`
  mutation PendingUserListRemoveUserBulkMutation(
    $ids: [UserId!]
    $searchTerm: String
    $filters: [Filter!]
    $excludedIds: [UserId!]
  ) {
    bulkRemovePendingUserFromOrganization(
      input: {
        ids: $ids
        searchTerm: $searchTerm
        filters: $filters
        excludedIds: $excludedIds
      }
    ) {
      success
    }
  }
`;

export const AcceptPendingUserBulkMutation = graphql`
  mutation PendingUserListAcceptUserBulkMutation(
    $ids: [UserId!]
    $searchTerm: String
    $filters: [Filter!]
    $excludedIds: [UserId!]
  ) {
    bulkAcceptPendingUserInOrganization(
      input: {
        ids: $ids
        searchTerm: $searchTerm
        filters: $filters
        excludedIds: $excludedIds
      }
    ) {
      success
    }
  }
`;
