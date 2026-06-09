import { PlatformIdentifier } from '../__generated__/resolvers-types';

export const RequiredPlatformVersions = {
  RefreshConnectivityStatusSendsNotFound: {
    [PlatformIdentifier.Opencti]: '6.8.16',
    [PlatformIdentifier.Openaev]: '2.0.6',
  },
  TenantIdRequired: {
    [PlatformIdentifier.Opencti]: null,
    [PlatformIdentifier.Openaev]: '2.4.0',
  },
  NewsFeedSupport: {
    [PlatformIdentifier.Opencti]: '7.260527.0', // OpenCTI 7.260527.0 is the first version to support news feed
    [PlatformIdentifier.Openaev]: null,
  },
} satisfies Record<string, Record<PlatformIdentifier, string | null>>;
