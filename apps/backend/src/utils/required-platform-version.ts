import { PlatformIdentifier } from '../__generated__/resolvers-types';

type RequiredPlatformVersionsConfig = {
  RefreshConnectivityStatusSendsNotFound: Record<
    PlatformIdentifier,
    string | null
  >;
  TenantIdRequired: Record<PlatformIdentifier, string | null>;
  NewsFeedSupport: Record<PlatformIdentifier, string | null>;
};

// A null value means the feature is disabled/not required for that identifier.
// Xtmone is null everywhere: not registrable yet.
export const RequiredPlatformVersions: RequiredPlatformVersionsConfig = {
  RefreshConnectivityStatusSendsNotFound: {
    [PlatformIdentifier.Opencti]: '6.8.16',
    [PlatformIdentifier.Openaev]: '2.0.6',
    [PlatformIdentifier.Xtmone]: null,
  },
  TenantIdRequired: {
    [PlatformIdentifier.Opencti]: null,
    [PlatformIdentifier.Openaev]: '2.4.0',
    [PlatformIdentifier.Xtmone]: null,
  },
  NewsFeedSupport: {
    [PlatformIdentifier.Opencti]: '7.260527.0', // OpenCTI 7.260527.0 is the first version to support news feed
    [PlatformIdentifier.Openaev]: null,
    [PlatformIdentifier.Xtmone]: null,
  },
};
