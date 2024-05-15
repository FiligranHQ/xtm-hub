'use client';

import { pageLoaderServiceQuery } from '../../../__generated__/pageLoaderServiceQuery.graphql';
import * as React from 'react';
import { useMemo } from 'react';
import {
  PreloadedQuery,
  useFragment,
  usePaginationFragment,
  usePreloadedQuery,
  useSubscription,
} from 'react-relay';
import { serviceList_services$key } from '../../../__generated__/serviceList_services.graphql';
import { serviceList_fragment$key } from '../../../__generated__/serviceList_fragment.graphql';
import {
  serviceListFragment,
  servicesListFragment,
  subscription,
} from '@/components/service/service.graphql';
import ServiceCreateForm from '@/components/service/service-create-form';
import { Button } from 'filigran-ui/servers';
import { ServiceListQuery } from '../../../app/(application)/(user)/service/page-loader';
import Loader from '@/components/loader';

interface ServiceItemProps {
  node: serviceList_fragment$key;
}

interface ServiceProps {
  queryRef: PreloadedQuery<pageLoaderServiceQuery>;
}

const ServiceItem: React.FunctionComponent<ServiceItemProps> = ({ node }) => {
  const data = useFragment<serviceList_fragment$key>(serviceListFragment, node);
  return <li key={data?.id}>{data?.name}</li>;
};

const ServiceList: React.FunctionComponent<ServiceProps> = ({ queryRef }) => {
  const queryData = usePreloadedQuery<pageLoaderServiceQuery>(
    ServiceListQuery,
    queryRef
  );
  const { data, loadNext, isLoadingNext, isLoadingPrevious, refetch } =
    usePaginationFragment<pageLoaderServiceQuery, serviceList_services$key>(
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
      <React.Suspense fallback={<Loader />}>
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
