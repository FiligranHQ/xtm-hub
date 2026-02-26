import { DeploymentRequestPlatformRegionEnum } from '@generated/models/DeploymentRequestPlatformRegion.enum';

export const REGIONS_VALUES = Object.values(
  DeploymentRequestPlatformRegionEnum
);
export const REGIONS = Object.values(DeploymentRequestPlatformRegionEnum).map(
  (region) => ({
    value: region,
    label: region.toUpperCase(),
  })
);
