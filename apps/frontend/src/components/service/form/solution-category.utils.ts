import { portalGraphqlClient } from '@/lib/graphql-client';
import { formatName } from '@/utils/format/name';
import {
  FiligranProduct,
  OrderingMode,
  SolutionCategoryOrdering,
  useSolutionCategoriesListQuery,
} from '@graphql/generated';

export const getSolutionCategories = (product?: FiligranProduct) => {
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

  return (data?.solutionCategories?.edges ?? [])
    .map(({ node }) => node)
    .map(({ id, name }) => ({
      id,
      name: formatName(name),
    }));
};
