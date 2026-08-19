import { portalGraphqlClient } from '@/lib/graphql-client';
import {
  FiligranProduct,
  OrderingMode,
  SolutionCategoryOrdering,
  useSolutionCategoriesListQuery,
} from '@graphql/generated';
import { useMemo } from 'react';

export const useSolutionCategories = (product?: FiligranProduct) => {
  const variables = {
    count: 100,
    cursor: null,
    orderBy: SolutionCategoryOrdering.Name,
    orderMode: OrderingMode.Asc,
    product: product ?? null,
  };

  const { data } = useSolutionCategoriesListQuery(
    portalGraphqlClient,
    variables
  );

  return useMemo(
    () =>
      (data?.solutionCategories?.edges ?? [])
        .map(({ node }) => node)
        .map(({ id, name }) => ({
          id,
          name: name,
        })),
    [data]
  );
};
