import { portalGraphqlClient } from '@/lib/graphql-client';
import { formatName } from '@/utils/format/name';
import {
  FiligranProduct,
  OrderingMode,
  UseCaseOrdering,
  useUseCasesListQuery,
} from '@graphql/generated';
import { useMemo } from 'react';

interface UseUseCasesOptions {
  documentType?: string;
  product?: FiligranProduct;
}

export const useUseCases = ({
  documentType,
  product,
}: UseUseCasesOptions = {}) => {
  const variables = {
    count: 500,
    orderBy: UseCaseOrdering.Name,
    orderMode: OrderingMode.Asc,
    documentType: documentType ?? null,
    product: product ?? null,
  };
  const { data } = useUseCasesListQuery(portalGraphqlClient, variables);

  return useMemo(
    () =>
      (data?.useCases?.edges ?? []).map(({ node }) => ({
        id: node.id,
        name: formatName(node.name),
        color: node.color,
      })),
    [data]
  );
};
