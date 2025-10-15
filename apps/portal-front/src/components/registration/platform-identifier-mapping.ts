import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';

export const PlatformTranslationMapping: Record<
  PlatformIdentifierEnum,
  string
> = {
  [PlatformIdentifierEnum.OPENCTI]: 'OpenCTI',
  [PlatformIdentifierEnum.OPENAEV]: 'OpenAEV',
};
