import { formatTier } from '@/components/competitor/competitor.utils';
import { CompetitorTierEnum } from '@generated/models/CompetitorTier.enum';

describe('formatTier', () => {
  it.each([
    [CompetitorTierEnum.TIER1, 'Tier 1'],
    [CompetitorTierEnum.TIER2, 'Tier 2'],
    [CompetitorTierEnum.TIER3, 'Tier 3'],
  ])('should format %s as "%s"', (tier, expected) => {
    expect(formatTier(tier)).toBe(expected);
  });
});
