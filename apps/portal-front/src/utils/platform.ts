import { ShareableResourceType } from '@/utils/shareable-resources/shareable-resources.types';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';

export const getPlatformIdentifier = (type: string): PlatformIdentifierEnum => {
  return type === ShareableResourceType.OPENAEV_SCENARIO
    ? PlatformIdentifierEnum.OPENAEV
    : PlatformIdentifierEnum.OPENCTI;
};
