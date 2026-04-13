'use client';

import Loader from '@/components/loader';
import { RegistrationContextProvider } from '@/components/registration/context';
import { Register } from '@/components/registration/register';
import useDecodedQuery from '@/hooks/useDecodedQuery';
import useMountingLoader from '@/hooks/useMountingLoader';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import RegisterIsPlatformRegisteredQueryGraphql, {
  registerIsPlatformRegisteredQuery,
} from '@generated/registerIsPlatformRegisteredQuery.graphql';
import {
  PlatformContract,
  PlatformInput,
} from '@generated/registerPlatformMutation.graphql';
import { redirect, useParams } from 'next/navigation';
import React from 'react';
import { useQueryLoader } from 'react-relay';

export const PageLoader: React.FC = () => {
  const { identifier } = useParams<{ identifier: PlatformIdentifierEnum }>();
  if (!Object.values(PlatformIdentifierEnum).includes(identifier)) {
    return redirect('/');
  }

  const {
    platform_id,
    platform_title,
    platform_url,
    platform_contract,
    platform_version,
    tenant_id,
  } = useDecodedQuery();

  const areParametersValid =
    platform_id && platform_title && platform_url && platform_contract;
  if (!areParametersValid) {
    return redirect('/');
  }

  const [queryRef, loadQuery] =
    useQueryLoader<registerIsPlatformRegisteredQuery>(
      RegisterIsPlatformRegisteredQueryGraphql
    );
  useMountingLoader(loadQuery, {
    input: { platformId: platform_id, tenantId: tenant_id },
  });

  const platform: PlatformInput = {
    id: platform_id,
    title: platform_title,
    url: platform_url,
    contract: platform_contract as PlatformContract,
    version: platform_version,
    tenantId: tenant_id,
  };

  return queryRef ? (
    <RegistrationContextProvider identifier={identifier}>
      <Register
        queryRef={queryRef}
        platform={platform}
      />
    </RegistrationContextProvider>
  ) : (
    <Loader />
  );
};
