import {
  userListFragment,
  UserListQuery,
} from '@/components/admin/user/user-list';
import { userList_users$key } from '@generated/userList_users.graphql';
import {
  OrderingMode,
  userListQuery,
  UserOrdering,
} from '@generated/userListQuery.graphql';
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
  const queryData = useLazyLoadQuery<userListQuery>(
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
    userListQuery,
    userList_users$key
  >(userListFragment, queryData);

  return { data, refetch };
};
