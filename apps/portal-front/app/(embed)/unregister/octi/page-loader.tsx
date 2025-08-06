'use client';

import Loader from '@/components/loader';
import { UnregisterOCTI } from '@/components/unregister/octi';
import useDecodedQuery from '@/hooks/useDecodedQuery';
import useMountingLoader from '@/hooks/useMountingLoader';
import RegisterCanUnregisterOCTIPlatformQueryGraphql, {
  registerCanUnregisterOCTIPlatformQuery,
} from '@generated/registerCanUnregisterOCTIPlatformQuery.graphql';
import { redirect } from 'next/navigation';
import React from 'react';
import { useQueryLoader } from 'react-relay';

export const PageLoader: React.FC = () => {
  const { platform_id: platformId } = useDecodedQuery();

  const [queryRef, loadQuery] =
    useQueryLoader<registerCanUnregisterOCTIPlatformQuery>(
      RegisterCanUnregisterOCTIPlatformQueryGraphql
    );
  useMountingLoader(loadQuery, { input: { platformId } });
  if (!platformId) {
    return redirect('/');
  }

  return queryRef ? (
    <UnregisterOCTI
      queryRef={queryRef}
      platformId={platformId}
    />
  ) : (
    <Loader />
  );
};
