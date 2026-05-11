import { EditionTypeEnum } from '@generated/models/EditionType.enum';

export interface EditionTypeMetadata {
  label: string;
}

export const EditionTypeMapping: Record<EditionTypeEnum, EditionTypeMetadata> =
  {
    [EditionTypeEnum.COMMUNITY_EDITION]: {
      label: 'CE',
    },
    [EditionTypeEnum.ENTERPRISE_EDITION]: {
      label: 'EE',
    },
    [EditionTypeEnum.PARTIAL_EE]: {
      label: 'Partial EE',
    },
  };
