import { DeploymentRequestPlatformRegionEnum } from '@generated/models/DeploymentRequestPlatformRegion.enum';
import { DeploymentRequestUseCaseEnum } from '@generated/models/DeploymentRequestUseCase.enum';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';

export const REGIONS_VALUES = Object.values(
  DeploymentRequestPlatformRegionEnum
);
export const REGIONS = Object.values(DeploymentRequestPlatformRegionEnum).map(
  (region) => ({
    value: region,
    label: region.toUpperCase(),
  })
);

export const USE_CASES_BY_PLATFORMIDENTIFIER: Record<
  PlatformIdentifierEnum,
  DeploymentRequestUseCaseEnum[]
> = {
  [PlatformIdentifierEnum.OPENAEV]: (
    Object.values(
      DeploymentRequestUseCaseEnum
    ) as DeploymentRequestUseCaseEnum[]
  ).filter((v) => v.startsWith('oaev_')),
  [PlatformIdentifierEnum.OPENCTI]: (
    Object.values(
      DeploymentRequestUseCaseEnum
    ) as DeploymentRequestUseCaseEnum[]
  ).filter((v) => !v.startsWith('oaev_')),
};
