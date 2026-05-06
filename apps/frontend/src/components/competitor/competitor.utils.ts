import { CompetitorTierEnum } from '@generated/models/CompetitorTier.enum';

export const formatTier = (tier: CompetitorTierEnum) => {
  return tier.charAt(0).toUpperCase() + tier.slice(1, 4) + ' ' + tier.slice(4);
};
