'use client';

import { serviceListLocalStorage } from '@/components/service/components/service-list-localstorage';
import OpenaevScenariosList from '@/components/service/openaev-scenarios/[serviceInstanceId]/openaev-scenarios-list';
import { OpenaevScenariosListQuery } from '@/components/service/openaev-scenarios/openaev-scenario.graphql';
import { openaevScenariosQuery } from '@generated/openaevScenariosQuery.graphql';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
import { Skeleton } from 'filigran-ui';
import { useEffect } from 'react';
import { useQueryLoader } from 'react-relay';

interface PageLoaderProps {
  serviceInstance: serviceInstance_fragment$data;
}

const PageLoader = ({ serviceInstance }: PageLoaderProps) => {
  const [queryRef, loadQuery] = useQueryLoader<openaevScenariosQuery>(
    OpenaevScenariosListQuery
  );
  const { count, search, labels, setSearch, setLabels } =
    serviceListLocalStorage('ObasScenario');

  useEffect(() => {
    loadQuery(
      {
        count,
        orderBy: 'created_at',
        orderMode: 'desc',
        serviceInstanceId: serviceInstance.id,
        searchTerm: search,
        filters: [{ key: 'label', value: labels }],
      },
      {
        fetchPolicy: 'store-and-network',
      }
    );
  }, [loadQuery, count, serviceInstance, search, labels]);

  return (
    <>
      {queryRef ? (
        <OpenaevScenariosList
          serviceInstance={serviceInstance}
          queryRef={queryRef}
          search={search}
          onSearchChange={setSearch}
          onLabelFilterChange={setLabels}
          labels={labels}
        />
      ) : (
        <Skeleton className="w-full inset-1/2" />
      )}
    </>
  );
};

// Component export
export default PageLoader;
