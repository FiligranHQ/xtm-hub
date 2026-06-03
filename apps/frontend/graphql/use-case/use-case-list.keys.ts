import {
  type UseCasesListQueryVariables,
  useUseCasesListQuery,
} from '@graphql/generated';

export const useCaseListKeys = {
  all: useUseCasesListQuery.getRootKey,
  list: (variables: UseCasesListQueryVariables) =>
    useUseCasesListQuery.getKey(variables),
};
