import { PlatformIdentifier } from '../__generated__/resolvers-types';

type RequiredPlatformVersionsConfig = {
  RefreshConnectivityStatusSendsNotFound: Record<PlatformIdentifier, string>;
  TenantIdRequired: Record<PlatformIdentifier, string | null>;
};

export const RequiredPlatformVersions: RequiredPlatformVersionsConfig = {
  RefreshConnectivityStatusSendsNotFound: {
    [PlatformIdentifier.Opencti]: '6.8.16',
    [PlatformIdentifier.Openaev]: '2.0.6',
  },
  TenantIdRequired: {
    [PlatformIdentifier.Opencti]: null,
    [PlatformIdentifier.Openaev]: '2.4.0',
  },
};
