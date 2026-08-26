'use client';

import { FeatureVotingQuery } from '@/components/feature-voting/feature-voting.graphql';
import { FeatureVotingList } from '@/components/feature-voting/FeatureVotingList';
import { Skeleton } from '@filigran/ui';
import { featureVotingQuery } from '@generated/featureVotingQuery.graphql';
import { useEffect } from 'react';
import { useQueryLoader } from 'react-relay';

export const FeatureVotingPageLoader = () => {
  const [queryRef, loadQuery] =
    useQueryLoader<featureVotingQuery>(FeatureVotingQuery);

  useEffect(() => {
    loadQuery(
      {},
      {
        fetchPolicy: 'store-and-network',
      }
    );
  }, [loadQuery]);

  return (
    <>
      {queryRef ? (
        <FeatureVotingList queryRef={queryRef} />
      ) : (
        <Skeleton className="w-full inset-1/2" />
      )}
    </>
  );
};
