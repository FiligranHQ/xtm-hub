'use client';

import { PortalContext } from '@/components/me/AppPortalContext';
import { portalGraphqlClient } from '@/lib/graphql-client';
import {
  RegisteredPlatformsListQuery,
  useRegisteredPlatformsListQuery,
} from '@graphql/generated';
import { registeredPlatformsKeys } from '@graphql/registered-platforms/registered-platforms.keys';
import { useContext } from 'react';

export type ConnectedPlatform =
  RegisteredPlatformsListQuery['registeredPlatforms'][number];

const CONNECTED_PLATFORMS_VARIABLES = {
  input: { onlyActive: true, identifier: null, onlyTrial: null },
};

export const useConnectedPlatforms = () => {
  const { isPersonalSpace } = useContext(PortalContext);

  const { data, isLoading, isError } = useRegisteredPlatformsListQuery(
    portalGraphqlClient,
    CONNECTED_PLATFORMS_VARIABLES,
    {
      queryKey: registeredPlatformsKeys.list(CONNECTED_PLATFORMS_VARIABLES),
    }
  );

  const connectedPlatforms: ConnectedPlatform[] =
    !isPersonalSpace && data?.registeredPlatforms
      ? data.registeredPlatforms
      : [];

  return { connectedPlatforms, isLoading, isError };
};
