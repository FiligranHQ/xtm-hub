import { portalGraphqlClient } from '@/lib/graphql-client';
import {
  useUseCasesListQuery,
  type UseCasesListQueryVariables,
} from '@graphql/generated';
import {
  DEFAULT_USE_CASES_LIST_VARIABLES,
  useCaseKeys,
} from '../use-case.keys';

export const useUseCases = (
  variables: UseCasesListQueryVariables = DEFAULT_USE_CASES_LIST_VARIABLES
) =>
  useUseCasesListQuery(portalGraphqlClient, variables, {
    queryKey: useCaseKeys.list(variables),
  });
