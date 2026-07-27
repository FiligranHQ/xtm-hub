import {
  type SolutionCategoriesListQueryVariables,
  useSolutionCategoriesListQuery,
} from '@graphql/generated';

export const solutionCategoryListKeys = {
  all: useSolutionCategoriesListQuery.getRootKey,
  list: (variables: SolutionCategoriesListQueryVariables) =>
    useSolutionCategoriesListQuery.getKey(variables),
};
