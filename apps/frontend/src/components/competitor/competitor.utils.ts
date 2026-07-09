import { CompetitorTier } from '@graphql/generated';

export const formatTier = (tier: CompetitorTier) => {
  return tier.charAt(0).toUpperCase() + tier.slice(1, 4) + ' ' + tier.slice(4);
};
