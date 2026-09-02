import { type UsersQueryVariables, useUsersQuery } from '@graphql/generated';

export const usersKeys = {
  all: useUsersQuery.getRootKey,
  list: (variables: UsersQueryVariables) => useUsersQuery.getKey(variables),
};
