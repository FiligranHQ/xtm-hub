import { portalGraphqlClient } from '@/lib/graphql-client';
import { formatName } from '@/utils/format/name';
import {
  OrderingMode,
  UseCaseOrdering,
  useUseCasesListQuery,
} from '@graphql/generated';

export const getUseCases = (documentType?: string) => {
  const variables = {
    count: 500,
    orderBy: UseCaseOrdering.Name,
    orderMode: OrderingMode.Asc,
    documentType: documentType ?? null,
  };
  const { data } = useUseCasesListQuery(portalGraphqlClient, variables);
  return (data?.useCases?.edges ?? [])
    .map(({ node }) => node)
    .map(({ id, name, color }) => ({
      id,
      name: formatName(name),
      color,
    }));
};
