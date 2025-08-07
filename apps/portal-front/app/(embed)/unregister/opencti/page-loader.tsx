'use client';

import Loader from '@/components/loader';
import { UnregisterOpenCTI } from '@/components/unregister/opencti';
import useDecodedQuery from '@/hooks/useDecodedQuery';
import useMountingLoader from '@/hooks/useMountingLoader';
import RegisterCanUnregisterOpenCTIPlatformQueryGraphql, {
  registerCanUnregisterOpenCTIPlatformQuery,
} from '@generated/registerCanUnregisterOpenCTIPlatformQuery.graphql';
import { redirect } from 'next/navigation';
import React from 'react';
import { useQueryLoader } from 'react-relay';

export const PageLoader: React.FC = () => {
  const { platform_id: platformId } = useDecodedQuery();

  const [queryRef, loadQuery] =
    useQueryLoader<registerCanUnregisterOpenCTIPlatformQuery>(
      RegisterCanUnregisterOpenCTIPlatformQueryGraphql
    );
  useMountingLoader(loadQuery, { input: { platformId } });
  if (!platformId) {
    return redirect('/');
  }

  return queryRef ? (
    <UnregisterOpenCTI
      queryRef={queryRef}
      platformId={platformId}
    />
  ) : (
    <Loader />
  );
};
