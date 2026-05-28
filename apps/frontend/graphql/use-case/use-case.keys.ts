import {
  OrderingMode,
  UseCaseOrdering,
  type UseCasesListQueryVariables,
} from '@graphql/generated';

export const DEFAULT_USE_CASES_LIST_VARIABLES: UseCasesListQueryVariables = {
  count: 100,
  orderBy: UseCaseOrdering.Name,
  orderMode: OrderingMode.Asc,
};

export const useCaseKeys = {
  all: ['use-case'] as const,
  lists: () => [...useCaseKeys.all, 'list'] as const,
  list: (variables: UseCasesListQueryVariables) =>
    [...useCaseKeys.lists(), variables] as const,
  details: () => [...useCaseKeys.all, 'detail'] as const,
  detail: (id: string) => [...useCaseKeys.details(), id] as const,
} as const;