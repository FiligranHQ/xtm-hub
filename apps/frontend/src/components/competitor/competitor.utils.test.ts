import { formatTier } from '@/components/competitor/competitor.utils';
import { CompetitorTier } from '@graphql/generated';

describe('formatTier', () => {
  it.each([
    [CompetitorTier.Tier1, 'Tier 1'],
    [CompetitorTier.Tier2, 'Tier 2'],
    [CompetitorTier.Tier3, 'Tier 3'],
  ])('should format %s as "%s"', (tier, expected) => {
    expect(formatTier(tier)).toBe(expected);
  });
});
