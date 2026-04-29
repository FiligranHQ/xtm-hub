'use client';

import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import RegisterCanUnregisterPlatformQueryGraphql, {
  registerCanUnregisterPlatformQuery,
} from '@generated/registerCanUnregisterPlatformQuery.graphql';
import { redirect, useParams } from 'next/navigation';
import React from 'react';
import { useQueryLoader } from 'react-relay';
import Loader from '@/components/Loader';
import PublicPathError from '@/components/PublicPathError';
import { RegistrationContextProvider } from '@/components/registration/Context';
import { Unregister } from '@/components/registration/unregister/Index';
import useDecodedQuery from '@/hooks/use-decoded-query';
import useMountingLoader from '@/hooks/use-mounting-loader';

export const PageLoader: React.FC = () => {
  const { identifier } = useParams<{ identifier: PlatformIdentifierEnum }>();
  if (!Object.values(PlatformIdentifierEnum).includes(identifier)) {
    return (
      <PublicPathError
        error={{
          name: 'IDENTIFIER_NOT_FOUND',
          message: `ERROR when unregister : the identifier value is incorrect ${identifier}`,
        }}
      />
    );
  }

  const { platform_id: platformId, tenant_id: tenantId } = useDecodedQuery();

  const [queryRef, loadQuery] =
    useQueryLoader<registerCanUnregisterPlatformQuery>(
      RegisterCanUnregisterPlatformQueryGraphql
    );
  useMountingLoader(loadQuery, { input: { platformId, tenantId } });
  if (!platformId) {
    return redirect('/');
  }

  return queryRef ? (
    <RegistrationContextProvider identifier={identifier}>
      <Unregister
        queryRef={queryRef}
        platformId={platformId}
        tenantId={tenantId}
      />
    </RegistrationContextProvider>
  ) : (
    <Loader />
  );
};
