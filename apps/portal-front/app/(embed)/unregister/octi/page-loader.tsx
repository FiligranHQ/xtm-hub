'use client';

import Loader from '@/components/loader';
import { UnregisterOCTI } from '@/components/unregister/octi';
import useDecodedQuery from '@/hooks/useDecodedQuery';
import useMountingLoader from '@/hooks/useMountingLoader';
import EnrollCanUnregisterOCTIPlatformQueryGraphql, {
  enrollCanUnregisterOCTIPlatformQuery,
} from '@generated/enrollCanUnregisterOCTIPlatformQuery.graphql';
import { redirect } from 'next/navigation';
import React from 'react';
import { useQueryLoader } from 'react-relay';

export const PageLoader: React.FC = () => {
  const { platform_id: platformId } = useDecodedQuery();

  const [queryRef, loadQuery] =
    useQueryLoader<enrollCanUnregisterOCTIPlatformQuery>(
      EnrollCanUnregisterOCTIPlatformQueryGraphql
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
