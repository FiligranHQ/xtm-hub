'use client';

import { portalGraphqlClient } from '@/lib/graphql-client';
import {
  RegisteredPlatformsListQuery,
  useRegisteredPlatformsListQuery,
} from '@graphql/generated';
import { registeredPlatformsKeys } from '@graphql/registered-platforms/registered-platforms.keys';

export type ConnectedPlatform =
  RegisteredPlatformsListQuery['registeredPlatforms'][number];

const CONNECTED_PLATFORMS_VARIABLES = {
  input: { onlyActive: true, identifier: null, onlyTrial: null },
};

export const useConnectedPlatforms = () => {
  const { data, isLoading, isError } = useRegisteredPlatformsListQuery(
    portalGraphqlClient,
    CONNECTED_PLATFORMS_VARIABLES,
    {
      queryKey: registeredPlatformsKeys.list(CONNECTED_PLATFORMS_VARIABLES),
    }
  );

  return {
    connectedPlatforms: data?.registeredPlatforms ?? [],
    isLoading,
    isError,
  };
};
