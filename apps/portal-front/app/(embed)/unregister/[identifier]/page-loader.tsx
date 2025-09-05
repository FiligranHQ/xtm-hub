'use client';

import Loader from '@/components/loader';
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
import NotFound from '../../../not-found';

export const PageLoader: React.FC = () => {
  const { identifier } = useParams<{ identifier: PlatformIdentifierEnum }>();
  if (!Object.values(PlatformIdentifierEnum).includes(identifier)) {
    return <NotFound />;
  }

  const { platform_id: platformId } = useDecodedQuery();

  const [queryRef, loadQuery] =
    useQueryLoader<registerCanUnregisterPlatformQuery>(
      RegisterCanUnregisterPlatformQueryGraphql
    );
  useMountingLoader(loadQuery, { input: { platformId } });
  if (!platformId) {
    return redirect('/');
  }

  return queryRef ? (
    <RegistrationContextProvider identifier={identifier}>
      <Unregister
        queryRef={queryRef}
        platformId={platformId}
      />
    </RegistrationContextProvider>
  ) : (
    <Loader />
  );
};
