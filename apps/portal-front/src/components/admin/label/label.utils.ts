import {
  labelFragment,
  labelListFragment,
  LabelListQuery,
} from '@/components/admin/label/label.graphql';
import { formatName } from '@/utils/format/name';
import { labelListQuery } from '@generated/labelListQuery.graphql';
import { labelList_labels$key } from '@generated/labelList_labels.graphql';
import { label_fragment$key } from '@generated/label_fragment.graphql';
import {
  readInlineData,
  useLazyLoadQuery,
  useRefetchableFragment,
} from 'react-relay';

export const getLabels = (documentType?: string) => {
  const queryData = useLazyLoadQuery<labelListQuery>(
    LabelListQuery,
    { count: 500, orderBy: 'name', orderMode: 'asc', documentType },
    { fetchPolicy: 'network-only' }
  );
  const [data] = useRefetchableFragment<labelListQuery, labelList_labels$key>(
    labelListFragment,
    queryData
  );
  return (data.useCases?.edges ?? [])
    .map(({ node }) => readInlineData<label_fragment$key>(labelFragment, node))
    .filter((l) => !!l)
    .map(({ id, name, color }) => ({
      id,
      name: formatName(name),
      color,
    }));
};
