'use client';

import { portalGraphqlClient } from '@/lib/graphql-client';
import {
  useXtmonePlatformIntegrationStatusQuery,
  XtmonePlatformIntegrationStatusQuery,
} from '@graphql/generated';

export type XtmoneIntegrationStatus = NonNullable<
  XtmonePlatformIntegrationStatusQuery['xtmonePlatformIntegrationStatus']
>;

export type XtmoneIntegrationStatusEntry = XtmoneIntegrationStatus['opencti'];

export interface XtmoneStatusState {
  data?: XtmoneIntegrationStatus;
  isLoading: boolean;
  isError: boolean;
  hasUrl: boolean;
}

export const useXtmoneIntegrationStatus = (
  serviceInstanceId?: string | null
) => {
  const { data, isLoading, isError } = useXtmonePlatformIntegrationStatusQuery(
    portalGraphqlClient,
    { serviceInstanceId: serviceInstanceId ?? '' },
    {
      enabled: !!serviceInstanceId,
      retry: false,
      staleTime: 60_000,
    }
  );

  return {
    data: data?.xtmonePlatformIntegrationStatus ?? undefined,
    isLoading,
    isError,
  };
};
