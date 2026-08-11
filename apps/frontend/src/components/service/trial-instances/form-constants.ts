import {
  DeploymentRequestPlatformRegion,
  DeploymentRequestUseCase,
  PlatformIdentifier,
} from '@graphql/generated';

export const REGIONS_VALUES = Object.values(DeploymentRequestPlatformRegion);
export const REGIONS = Object.values(DeploymentRequestPlatformRegion).map(
  (region) => ({
    value: region,
    label: region.toUpperCase(),
  })
);

export const USE_CASES_BY_PLATFORM_IDENTIFIER: Record<
  PlatformIdentifier,
  DeploymentRequestUseCase[]
> = {
  [PlatformIdentifier.Openaev]: Object.values(DeploymentRequestUseCase).filter(
    (v) => v.startsWith('oaev_')
  ),
  [PlatformIdentifier.Opencti]: Object.values(DeploymentRequestUseCase).filter(
    (v) => !v.startsWith('oaev_')
  ),
  [PlatformIdentifier.Xtmone]: [],
};
