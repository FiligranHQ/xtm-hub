'use client';
import { EpicListQuery } from '@/components/epic/epic.graphql';
import { Skeleton } from '@filigran/ui';
import { epicsQuery } from '@generated/epicsQuery.graphql';
import { seoServiceInstanceFragment$data } from '@generated/seoServiceInstanceFragment.graphql';
import { useEffect } from 'react';
import { useQueryLoader } from 'react-relay';
import PublicEpicList from '@/components/epic/PublicEpicList';
interface PreloaderProps {
  serviceInstance: seoServiceInstanceFragment$data;
}

export const PublicEpicListPageLoader = ({
  serviceInstance,
}: PreloaderProps) => {
  const [queryRef, loadQuery] = useQueryLoader<epicsQuery>(EpicListQuery);
  useEffect(() => {
    loadQuery(
      {
        count: 500,

        orderBy: 'title',
        orderMode: 'asc',
      },
      {
        fetchPolicy: 'store-and-network',
      }
    );
  }, [loadQuery, serviceInstance]);

  return (
    <>
      {queryRef ? (
        <PublicEpicList
          serviceInstance={serviceInstance}
          queryRef={queryRef}
        />
      ) : (
        <Skeleton className="w-full inset-1/2" />
      )}
    </>
  );
};
