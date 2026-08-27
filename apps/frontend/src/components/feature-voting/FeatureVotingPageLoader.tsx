'use client';

import { FeatureVotingQuery } from '@/components/feature-voting/feature-voting.graphql';
import { FeatureVotingList } from '@/components/feature-voting/FeatureVotingList';
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav';
import { Skeleton } from '@filigran/ui';
import { featureVotingQuery } from '@generated/featureVotingQuery.graphql';
import { useEffect } from 'react';
import { useQueryLoader } from 'react-relay';

interface FeatureVotingPageLoaderProps {
  serviceInstanceId: string;
  /** Link back to the roadmap the voting round belongs to. */
  roadmapHref: string;
}

export const FeatureVotingPageLoader = ({
  serviceInstanceId,
  roadmapHref,
}: FeatureVotingPageLoaderProps) => {
  const [queryRef, loadQuery] =
    useQueryLoader<featureVotingQuery>(FeatureVotingQuery);

  useEffect(() => {
    loadQuery(
      { service_instance_id: serviceInstanceId },
      { fetchPolicy: 'store-and-network' }
    );
  }, [loadQuery, serviceInstanceId]);

  const breadcrumbValue = [
    {
      label: 'Epic.XTMRoadmap',
      href: roadmapHref,
    },
    {
      label: 'FeatureVoting.Title',
    },
  ];

  return (
    <>
      <BreadcrumbNav value={breadcrumbValue} />
      {queryRef ? (
        <FeatureVotingList queryRef={queryRef} />
      ) : (
        <Skeleton className="w-full inset-1/2" />
      )}
    </>
  );
};
