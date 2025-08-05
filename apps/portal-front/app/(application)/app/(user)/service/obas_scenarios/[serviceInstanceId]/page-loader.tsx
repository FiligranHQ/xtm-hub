'use client';

import ObasScenariosList from '@/components/service/obas-scenarios/[serviceInstanceId]/obas-scenarios-list';
import { obasScenarioListLocalStorage } from '@/components/service/obas-scenarios/[serviceInstanceId]/obas-scenarios-list-localstorage';
import { ObasScenariosListQuery } from '@/components/service/obas-scenarios/obas-scenario.graphql';
import { obasScenariosQuery } from '@generated/obasScenariosQuery.graphql';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
import { Skeleton } from 'filigran-ui';
import { useEffect } from 'react';
import { useQueryLoader } from 'react-relay';

interface PageLoaderProps {
  serviceInstance: serviceInstance_fragment$data;
}

const PageLoader = ({ serviceInstance }: PageLoaderProps) => {
  const [queryRef, loadQuery] = useQueryLoader<obasScenariosQuery>(
    ObasScenariosListQuery
  );
  const { count, search, labels, setSearch, setLabels } =
    obasScenarioListLocalStorage();

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
        <ObasScenariosList
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
