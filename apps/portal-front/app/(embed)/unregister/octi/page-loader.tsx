'use client';

import Loader from '@/components/loader';
import { UnenrollOCTI } from '@/components/unregister/octi';
import useDecodedQuery from '@/hooks/useDecodedQuery';
import useMountingLoader from '@/hooks/useMountingLoader';
import EnrollCanUnenrollOCTIPlatformQueryGraphql, {
  enrollCanUnenrollOCTIPlatformQuery,
} from '@generated/enrollCanUnenrollOCTIPlatformQuery.graphql';
import { redirect } from 'next/navigation';
import React from 'react';
import { useQueryLoader } from 'react-relay';

export const PageLoader: React.FC = () => {
  const { platform_id: platformId } = useDecodedQuery();

  const [queryRef, loadQuery] =
    useQueryLoader<enrollCanUnenrollOCTIPlatformQuery>(
      EnrollCanUnenrollOCTIPlatformQueryGraphql
    );
  useMountingLoader(loadQuery, { input: { platformId } });
  if (!platformId) {
    return redirect('/');
  }

  return queryRef ? (
    <UnenrollOCTI
      queryRef={queryRef}
      platformId={platformId}
    />
  ) : (
    <Loader />
  );
};
