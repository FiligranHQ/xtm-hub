'use client';

import { preloaderServiceQuery } from '../../../__generated__/preloaderServiceQuery.graphql';
import * as React from 'react';
import { useMemo } from 'react';
import {
  PreloadedQuery,
  useFragment,
  usePaginationFragment,
  usePreloadedQuery,
  useSubscription,
} from 'react-relay';
import { PreloaderQuery } from '../../../app/service/preloader';
import { serviceList_services$key } from '../../../__generated__/serviceList_services.graphql';
import { useRouter } from 'next/navigation';
import { serviceList_fragment$key } from '../../../__generated__/serviceList_fragment.graphql';
import {
  serviceListFragment,
  servicesListFragment,
  subscription,
} from '@/components/service/service.graphql';
import ServiceCreateForm from '@/components/service/service-create-form';
import { Button } from '@/components/ui/button';

interface ServiceItemProps {
  node: serviceList_fragment$key;
}

interface ServiceProps {
  queryRef: PreloadedQuery<preloaderServiceQuery>;
}

const ServiceItem: React.FunctionComponent<ServiceItemProps> = ({ node }) => {
  const data = useFragment<serviceList_fragment$key>(serviceListFragment, node);
  return <li key={data?.id}>{data?.name}</li>;
};

const ServiceList: React.FunctionComponent<ServiceProps> = ({ queryRef }) => {
  const router = useRouter();
  const handleRefresh = () => {
    router.refresh();
  };
  const queryData = usePreloadedQuery<preloaderServiceQuery>(
    PreloaderQuery,
    queryRef
  );
  const { data, loadNext, isLoadingNext, isLoadingPrevious, refetch } =
    usePaginationFragment<preloaderServiceQuery, serviceList_services$key>(
      servicesListFragment,
      queryData
    );

  const connectionID = data?.services?.__id;
  const config = useMemo(
    () => ({
      variables: { connections: [connectionID] },
      subscription,
    }),
    [connectionID]
  );

  useSubscription(config);
  return (
    <>
      <React.Suspense fallback="Loading...">
        <div className="bg-[#e9cffc]">
          <ul>
            {data.services?.edges.map(({ node }) => (
              <ServiceItem
                key={node?.id}
                node={node}
              />
            ))}
          </ul>
          {isLoadingNext && <span>... next loading ...</span>}
          {isLoadingPrevious && <span>... previous loading ...</span>}
          <Button
            variant="ghost"
            onClick={() => loadNext(1)}>
            Load more
          </Button>
        </div>
        <div>
          <Button
            variant="ghost"
            onClick={handleRefresh}>
            # Router refresh #
          </Button>
        </div>
        <div>
          <Button
            variant="ghost"
            onClick={() => refetch({ orderBy: 'name', orderMode: 'desc' })}>
            # Reverse order #
          </Button>
        </div>
      </React.Suspense>
      <ServiceCreateForm connectionID={connectionID} />
    </>
  );
};
// endregion

export default ServiceList;
