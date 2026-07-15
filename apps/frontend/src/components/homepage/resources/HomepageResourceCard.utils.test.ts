import { describe, expect, it } from 'vitest';
import { computeTitlePaddingRight } from './HomepageResourceCard.utils';

describe('computeTitlePaddingRight', () => {
  it.each`
    iconCount | expected | description
    ${0}      | ${8}     | ${'buffer only when no icons'}
    ${1}      | ${32}    | ${'one icon: 24 + 0 gap + 8 buffer'}
    ${2}      | ${60}    | ${'two icons: 48 + 4 gap + 8 buffer'}
    ${3}      | ${88}    | ${'three icons: 72 + 8 gaps + 8 buffer'}
  `(
    'returns $expected px for $iconCount icon(s) ($description)',
    ({ iconCount, expected }: { iconCount: number; expected: number }) => {
      expect(computeTitlePaddingRight(iconCount)).toBe(expected);
    }
  );
});
