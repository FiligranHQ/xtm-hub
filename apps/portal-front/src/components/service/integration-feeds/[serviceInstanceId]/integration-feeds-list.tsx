import {
  ServiceListFilterKey,
  ServiceListFilterMap,
} from '@/components/service/components/header/service-list-header';
import { AppServiceContext } from '@/components/service/components/service-context';
import ServiceList from '@/components/service/components/service-list';
import { useActiveAndDraftSplit } from '@/components/service/components/service-list-utils';
import { useServiceListLocalStorage } from '@/components/service/components/use-service-list-local-storage';
import { useCsvFeedContext } from '@/components/service/csv-feeds/use-csv-feed-context';
import {
  integrationFeedsFragment,
  integrationFeedsItem,
  IntegrationFeedsListQuery,
} from '@/components/service/integration-feeds/integration-feed.graphql';
import { IntegrationFeedFilters } from '@/components/ui/shareable-resource/integration-feed/integration-feed-filters';
import {
  integrationFeedsItem_fragment$data,
  integrationFeedsItem_fragment$key,
} from '@generated/integrationFeedsItem_fragment.graphql';
import { integrationFeedsList$key } from '@generated/integrationFeedsList.graphql';
import { integrationFeedsQuery } from '@generated/integrationFeedsQuery.graphql';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
import {
  PreloadedQuery,
  usePreloadedQuery,
  useRefetchableFragment,
} from 'react-relay';

interface IntegrationFeedsListProps {
  queryRef: PreloadedQuery<integrationFeedsQuery>;
  serviceInstance: serviceInstance_fragment$data;
  search: string;
  onSearchChange: (v: string) => void;
}

const IntegrationFeedsList = ({
  queryRef,
  serviceInstance,
  search,
  onSearchChange,
}: IntegrationFeedsListProps) => {
  const queryData = usePreloadedQuery<integrationFeedsQuery>(
    IntegrationFeedsListQuery,
    queryRef
  );

  const [data] = useRefetchableFragment<
    integrationFeedsQuery,
    integrationFeedsList$key
  >(integrationFeedsFragment, queryData);

  const [active, draft] = useActiveAndDraftSplit<
    integrationFeedsItem_fragment$data,
    integrationFeedsItem_fragment$key
  >(data?.integrationFeeds.edges, integrationFeedsItem);

  const connectionId = data?.integrationFeeds.__id;

  const context = useCsvFeedContext(serviceInstance, connectionId);

  const { removeConnectorTypes, removeIntegrationTypes } =
    useServiceListLocalStorage(context.localStorageKey);

  const filters: ServiceListFilterMap = {
    [ServiceListFilterKey.IntegrationFeedType]: {
      node: <IntegrationFeedFilters />,
      reset: () => {
        removeConnectorTypes();
        removeIntegrationTypes();
      },
    },
  };

  return (
    <AppServiceContext {...context}>
      <ServiceList
        active={active}
        draft={draft}
        search={search}
        onSearchChange={onSearchChange}
        additionalFilters={filters}
      />
    </AppServiceContext>
  );
};

export default IntegrationFeedsList;
