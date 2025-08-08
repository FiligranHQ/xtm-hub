'use client';

import Loader from '@/components/loader';
import { RegisterOpenCTI } from '@/components/register/opencti';
import useDecodedQuery from '@/hooks/useDecodedQuery';
import useMountingLoader from '@/hooks/useMountingLoader';
import RegisterIsOpenCTIPlatformRegisteredQueryGraphql, {
  registerIsOpenCTIPlatformRegisteredQuery,
} from '@generated/registerIsOpenCTIPlatformRegisteredQuery.graphql';
import { OpenCTIPlatformContract } from '@generated/registerOpenCTIPlatformFragment.graphql';
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
    useQueryLoader<registerIsOpenCTIPlatformRegisteredQuery>(
      RegisterIsOpenCTIPlatformRegisteredQueryGraphql
    );
  useMountingLoader(loadQuery, { input: { platformId: platform_id } });

  const platform = {
    id: platform_id,
    title: platform_title,
    url: platform_url,
    contract: platform_contract as OpenCTIPlatformContract,
  };

  return queryRef ? (
    <RegisterOpenCTI
      queryRef={queryRef}
      platform={platform}
    />
  ) : (
    <Loader />
  );
};
