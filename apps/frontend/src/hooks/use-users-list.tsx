import {
  userListFragment,
  UserListQuery,
} from '@/components/admin/user/UserList';
import { UserList_users$key } from '@generated/UserList_users.graphql';
import {
  OrderingMode,
  UserListQuery as UserListQueryType,
  UserOrdering,
} from '@generated/UserListQuery.graphql';
import { useLazyLoadQuery, useRefetchableFragment } from 'react-relay';
import { FetchPolicy } from 'relay-runtime';

interface Props {
  pageSize: number;
  orderMode: OrderingMode;
  orderBy: UserOrdering;
  filter: {
    search?: string;
    organization?: string;
  };
  fetchPolicy?: FetchPolicy;
}

export const useUsersList = ({
  pageSize,
  orderMode,
  orderBy,
  filter,
  fetchPolicy,
}: Props) => {
  const queryData = useLazyLoadQuery<UserListQueryType>(
    UserListQuery,
    {
      count: pageSize,
      orderMode,
      orderBy,
      searchTerm: filter.search,
      filters: filter.organization
        ? [{ key: 'organization_id', value: [filter.organization] }]
        : undefined,
    },
    { fetchPolicy }
  );

  const [data, refetch] = useRefetchableFragment<
    UserListQueryType,
    UserList_users$key
  >(userListFragment, queryData);

  return { data, refetch };
};
