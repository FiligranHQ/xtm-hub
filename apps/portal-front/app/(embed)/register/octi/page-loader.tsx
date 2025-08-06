'use client';

import Loader from '@/components/loader';
import { EnrollOCTI } from '@/components/register/octi';
import useDecodedQuery from '@/hooks/useDecodedQuery';
import useMountingLoader from '@/hooks/useMountingLoader';
import EnrollIsOCTIPlatformRegisteredQueryGraphql, {
  enrollIsOCTIPlatformRegisteredQuery,
} from '@generated/enrollIsOCTIPlatformRegisteredQuery.graphql';
import { OCTIPlatformContract } from '@generated/enrollOCTIPlatformFragment.graphql';
import { redirect } from 'next/navigation';
import React from 'react';
import { useQueryLoader } from 'react-relay';

export const PageLoader: React.FC = () => {
  const { platform_id, platform_title, platform_url, platform_contract } =
    useDecodedQuery();

  const areParametersValid =
    platform_id && platform_title && platform_url && platform_contract;
  if (!areParametersValid) {
    return redirect('/');
  }

  const [queryRef, loadQuery] =
    useQueryLoader<enrollIsOCTIPlatformRegisteredQuery>(
      EnrollIsOCTIPlatformRegisteredQueryGraphql
    );
  useMountingLoader(loadQuery, { input: { platformId: platform_id } });

  const platform = {
    id: platform_id,
    title: platform_title,
    url: platform_url,
    contract: platform_contract as OCTIPlatformContract,
  };

  return queryRef ? (
    <EnrollOCTI
      queryRef={queryRef}
      platform={platform}
    />
  ) : (
    <Loader />
  );
};
