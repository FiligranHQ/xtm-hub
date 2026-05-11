import { EditionTypeEnum } from '@generated/models/EditionType.enum';
import { describe, expect, it } from 'vitest';
import { EditionTypeMapping } from './EditionTypeMapping';

describe('EditionTypeMapping', () => {
  it.each`
    editionType                           | expectedLabel
    ${EditionTypeEnum.COMMUNITY_EDITION}  | ${'CE'}
    ${EditionTypeEnum.ENTERPRISE_EDITION} | ${'EE'}
    ${EditionTypeEnum.PARTIAL_EE}         | ${'Partial EE'}
  `(
    'maps $editionType with expected label',
    ({
      editionType,
      expectedLabel,
    }: {
      editionType: EditionTypeEnum;
      expectedLabel: string;
    }) => {
      const metadata = EditionTypeMapping[editionType];

      expect(metadata.label).toBe(expectedLabel);
    }
  );
});
