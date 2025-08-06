'use client';

import Loader from '@/components/loader';
import { RegisterOCTI } from '@/components/register/octi';
import useDecodedQuery from '@/hooks/useDecodedQuery';
import useMountingLoader from '@/hooks/useMountingLoader';
import RegisterIsOCTIPlatformRegisteredQueryGraphql, {
  registerIsOCTIPlatformRegisteredQuery,
} from '@generated/registerIsOCTIPlatformRegisteredQuery.graphql';
import { OCTIPlatformContract } from '@generated/registerOCTIPlatformFragment.graphql';
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
    useQueryLoader<registerIsOCTIPlatformRegisteredQuery>(
      RegisterIsOCTIPlatformRegisteredQueryGraphql
    );
  useMountingLoader(loadQuery, { input: { platformId: platform_id } });

  const platform = {
    id: platform_id,
    title: platform_title,
    url: platform_url,
    contract: platform_contract as OCTIPlatformContract,
  };

  return queryRef ? (
    <RegisterOCTI
      queryRef={queryRef}
      platform={platform}
    />
  ) : (
    <Loader />
  );
};
