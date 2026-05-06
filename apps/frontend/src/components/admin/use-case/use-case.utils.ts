import {
  useCaseFragment,
  useCaseListFragment,
  UseCaseListQuery,
} from '@/components/admin/use-case/use-case.graphql';
import { formatName } from '@/utils/format/name';
import { useCaseListQuery } from '@generated/useCaseListQuery.graphql';
import { useCase_fragment$key } from '@generated/useCase_fragment.graphql';
import { useCase_list_fragment$key } from '@generated/useCase_list_fragment.graphql';
import {
  readInlineData,
  useLazyLoadQuery,
  useRefetchableFragment,
} from 'react-relay';

export const getUseCases = (documentType?: string) => {
  const queryData = useLazyLoadQuery<useCaseListQuery>(
    UseCaseListQuery,
    { count: 500, orderBy: 'name', orderMode: 'asc', documentType },
    { fetchPolicy: 'network-only' }
  );
  const [data] = useRefetchableFragment<
    useCaseListQuery,
    useCase_list_fragment$key
  >(useCaseListFragment, queryData);
  return (data.useCases?.edges ?? [])
    .map(({ node }) =>
      readInlineData<useCase_fragment$key>(useCaseFragment, node)
    )
    .filter((l) => !!l)
    .map(({ id, name, color }) => ({
      id,
      name: formatName(name),
      color,
    }));
};
