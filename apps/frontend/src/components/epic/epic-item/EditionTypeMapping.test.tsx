import { EditionType } from '@graphql/generated';
import { describe, expect, it } from 'vitest';
import { EditionTypeMapping } from './EditionTypeMapping';

describe('EditionTypeMapping', () => {
  it.each`
    editionType                      | expectedLabel
    ${EditionType.CommunityEdition}  | ${'CE'}
    ${EditionType.EnterpriseEdition} | ${'EE'}
    ${EditionType.PartialEe}         | ${'Partial EE'}
  `(
    'maps $editionType with expected label',
    ({
      editionType,
      expectedLabel,
    }: {
      editionType: EditionType;
      expectedLabel: string;
    }) => {
      const metadata = EditionTypeMapping[editionType];

      expect(metadata.label).toBe(expectedLabel);
    }
  );
});
