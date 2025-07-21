'use client';

import Loader from '@/components/loader';
import { UnenrollOCTI } from '@/components/unenroll/octi';
import useDecodedQuery from '@/hooks/useDecodedQuery';
import useMountingLoader from '@/hooks/useMountingLoader';
import EnrollCanUnenrollOCTIInstanceQueryGraphql, {
  enrollCanUnenrollOCTIInstanceQuery,
} from '@generated/enrollCanUnenrollOCTIInstanceQuery.graphql';
import { redirect } from 'next/navigation';
import React from 'react';
import { useQueryLoader } from 'react-relay';

export const PageLoader: React.FC = () => {
  const { platform_id: platformId } = useDecodedQuery();

  const [queryRef, loadQuery] =
    useQueryLoader<enrollCanUnenrollOCTIInstanceQuery>(
      EnrollCanUnenrollOCTIInstanceQueryGraphql
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
