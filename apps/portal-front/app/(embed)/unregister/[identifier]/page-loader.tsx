'use client';

import Loader from '@/components/loader';
import PublicPathError from '@/components/public-path-error';
import { RegistrationContextProvider } from '@/components/registration/context';
import { Unregister } from '@/components/registration/unregister';
import useDecodedQuery from '@/hooks/useDecodedQuery';
import useMountingLoader from '@/hooks/useMountingLoader';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import RegisterCanUnregisterPlatformQueryGraphql, {
  registerCanUnregisterPlatformQuery,
} from '@generated/registerCanUnregisterPlatformQuery.graphql';
import { redirect, useParams } from 'next/navigation';
import React from 'react';
import { useQueryLoader } from 'react-relay';

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
