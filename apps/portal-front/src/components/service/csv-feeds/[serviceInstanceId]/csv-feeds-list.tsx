import {
  csvFeedsFragment,
  csvFeedsItem,
  CsvFeedsListQuery,
} from '@/components/service/csv-feeds/csv-feed.graphql';

import {
  csvFeedsItem_fragment$data,
  csvFeedsItem_fragment$key,
} from '@generated/csvFeedsItem_fragment.graphql';

import { AppServiceContext } from '@/components/service/components/service-context';
import ServiceList from '@/components/service/components/service-list';
import { useActiveAndDraftSplit } from '@/components/service/components/service-list-utils';
import { useCsvFeedContext } from '@/components/service/csv-feeds/use-csv-feed-context';
import { csvFeedsList$key } from '@generated/csvFeedsList.graphql';
import { csvFeedsQuery } from '@generated/csvFeedsQuery.graphql';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
import {
  PreloadedQuery,
  usePreloadedQuery,
  useRefetchableFragment,
} from 'react-relay';

interface CsvFeedsListProps {
  queryRef: PreloadedQuery<csvFeedsQuery>;
  serviceInstance: serviceInstance_fragment$data;
  labels?: string[];
  search: string;
  onSearchChange: (v: string) => void;
  onLabelFilterChange: (v: string[]) => void;
}

const CsvFeedsList = ({
  queryRef,
  serviceInstance,
  search,
  onSearchChange,
  onLabelFilterChange,
  labels,
}: CsvFeedsListProps) => {
  const queryData = usePreloadedQuery<csvFeedsQuery>(
    CsvFeedsListQuery,
    queryRef
  );

  const [data] = useRefetchableFragment<csvFeedsQuery, csvFeedsList$key>(
    csvFeedsFragment,
    queryData
  );

  const [active, draft] = useActiveAndDraftSplit<
    csvFeedsItem_fragment$data,
    csvFeedsItem_fragment$key
  >(data?.csvFeeds.edges, csvFeedsItem);

  const connectionId = data?.csvFeeds.__id;

  const context = useCsvFeedContext(serviceInstance, connectionId);

  return (
    <AppServiceContext {...context}>
      <ServiceList
        active={active}
        draft={draft}
        search={search}
        onSearchChange={onSearchChange}
        labels={labels}
        onLabelFilterChange={onLabelFilterChange}
      />
    </AppServiceContext>
  );
};

export default CsvFeedsList;
