import { EditionType } from '@graphql/generated';

export interface EditionTypeMetadata {
  label: string;
}

export const EditionTypeMapping: Record<EditionType, EditionTypeMetadata> = {
  [EditionType.CommunityEdition]: {
    label: 'CE',
  },
  [EditionType.EnterpriseEdition]: {
    label: 'EE',
  },
  [EditionType.PartialEe]: {
    label: 'Partial EE',
  },
};
