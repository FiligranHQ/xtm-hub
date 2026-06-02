import { PlatformIdentifier } from '../__generated__/resolvers-types';

export const RequiredPlatformVersions: Record<
  string,
  Record<PlatformIdentifier, string | null>
> = {
  RefreshConnectivityStatusSendsNotFound: {
    [PlatformIdentifier.Opencti]: '6.8.16',
    [PlatformIdentifier.Openaev]: '2.0.6',
  },
  TenantIdRequired: {
    [PlatformIdentifier.Opencti]: null,
    [PlatformIdentifier.Openaev]: '2.4.0',
  },
};
