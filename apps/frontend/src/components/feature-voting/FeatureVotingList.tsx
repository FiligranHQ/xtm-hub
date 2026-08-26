'use client';

import { FiligranProductMapping } from '@/components/epic/epic-item/FiligranProductMapping';
import { FeatureVotingQuery } from '@/components/feature-voting/feature-voting.graphql';
import { FeatureVotingItem } from '@/components/feature-voting/FeatureVotingItem';
import { featureVoting_fragment$data } from '@generated/featureVoting_fragment.graphql';
import { featureVotingQuery } from '@generated/featureVotingQuery.graphql';
import { FiligranProduct } from '@graphql/generated';
import { useTranslations } from 'next-intl';
import { PreloadedQuery, usePreloadedQuery } from 'react-relay';

const PRODUCT_ORDER: FiligranProduct[] = [
  FiligranProduct.Opencti,
  FiligranProduct.Openaev,
  FiligranProduct.Xtmone,
  FiligranProduct.Xtmhub,
];

interface FeatureVotingListProps {
  queryRef: PreloadedQuery<featureVotingQuery>;
}

export const FeatureVotingList = ({ queryRef }: FeatureVotingListProps) => {
  const t = useTranslations();
  const data = usePreloadedQuery<featureVotingQuery>(
    FeatureVotingQuery,
    queryRef
  );

  const isAuthenticated = !!data.me?.id;
  const round = data.currentVotingRound;

  if (!round) {
    return (
      <div className="flex flex-col gap-s">
        <h1 className="text-2xl font-semibold">{t('FeatureVoting.Title')}</h1>
        <p className="text-muted-foreground">
          {t('FeatureVoting.NoOpenRound')}
        </p>
      </div>
    );
  }

  const features = round.features as featureVoting_fragment$data[];
  const sections = PRODUCT_ORDER.map((product) => ({
    product,
    features: features.filter((feature) => feature.product === product),
  })).filter((section) => section.features.length > 0);

  return (
    <div className="flex flex-col gap-xl">
      <div className="flex flex-col gap-s">
        <h1 className="text-2xl font-semibold">{t('FeatureVoting.Title')}</h1>
        <p className="text-muted-foreground">
          {round.description ?? t('FeatureVoting.Description')}
        </p>
      </div>
      {sections.map(({ product, features: productFeatures }) => (
        <section
          key={product}
          className="flex flex-col gap-m">
          <div className="flex items-center gap-s">
            {FiligranProductMapping[product].logo}
            <h2 className="text-xl font-semibold">
              {FiligranProductMapping[product].name}
            </h2>
          </div>
          <p className="text-muted-foreground text-sm">
            {t('FeatureVoting.OneVotePerProduct')}
          </p>
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-l">
            {productFeatures.map((feature) => (
              <FeatureVotingItem
                key={feature.id}
                feature={feature}
                isAuthenticated={isAuthenticated}
              />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
};
