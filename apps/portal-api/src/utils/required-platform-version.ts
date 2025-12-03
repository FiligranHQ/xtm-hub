import { PlatformIdentifier } from '../__generated__/resolvers-types';

export const RequiredPlatformVersions: Record<
  string,
  Record<PlatformIdentifier, string>
> = {
  RefreshConnectivityStatusSendsNotFound: {
    // TODO: change it for the updated versions
    [PlatformIdentifier.Opencti]: '6.9.0',
    [PlatformIdentifier.Openaev]: '2.1.0',
  },
};
