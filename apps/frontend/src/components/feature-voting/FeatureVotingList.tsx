'use client';

import { FiligranProductMapping } from '@/components/epic/epic-item/FiligranProductMapping';
import { FeatureVotingItem } from '@/components/feature-voting/FeatureVotingItem';
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav';
import { portalGraphqlClient } from '@/lib/graphql-client';
import { Skeleton } from '@filigran/ui';
import { featureVotingKeys } from '@graphql/feature-voting/feature-voting.keys';
import {
  FiligranProduct,
  useCurrentVotingRoundQuery,
  VotableFeaturePublicFragment,
} from '@graphql/generated';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

const PRODUCT_ORDER: FiligranProduct[] = [
  FiligranProduct.Opencti,
  FiligranProduct.Openaev,
  FiligranProduct.Xtmone,
  FiligranProduct.Xtmhub,
];

interface FeatureVotingListProps {
  serviceInstanceId: string;
  /** Link back to the roadmap the voting round belongs to. */
  roadmapHref: string;
}

export const FeatureVotingList = ({
  serviceInstanceId,
  roadmapHref,
}: FeatureVotingListProps) => {
  const t = useTranslations();

  const variables = useMemo(
    () => ({ service_instance_id: serviceInstanceId }),
    [serviceInstanceId]
  );

  const { data, isLoading } = useCurrentVotingRoundQuery(
    portalGraphqlClient,
    variables,
    { queryKey: featureVotingKeys.current(variables) }
  );

  const round = data?.currentVotingRound;
  const isAuthenticated = !!data?.me?.id;

  const sections = useMemo(() => {
    const features: VotableFeaturePublicFragment[] = round?.features ?? [];
    return PRODUCT_ORDER.map((product) => ({
      product,
      features: features.filter((feature) => feature.product === product),
    })).filter((section) => section.features.length > 0);
  }, [round]);

  const breadcrumbValue = [
    {
      label: 'Epic.XTMRoadmap',
      href: roadmapHref,
    },
    {
      label: 'FeatureVoting.Title',
    },
  ];

  return (
    <>
      <BreadcrumbNav value={breadcrumbValue} />
      {isLoading && <Skeleton className="w-full inset-1/2" />}
      {!isLoading && !round && (
        <div className="flex flex-col gap-s">
          <h1 className="text-2xl font-semibold">{t('FeatureVoting.Title')}</h1>
          <p className="text-muted-foreground">
            {t('FeatureVoting.NoOpenRound')}
          </p>
        </div>
      )}
      {!isLoading && round && (
        <div className="flex flex-col gap-xl">
          <div className="flex flex-col gap-s">
            <h1 className="text-2xl font-semibold">
              {t('FeatureVoting.Title')}
            </h1>
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
                    serviceInstanceId={serviceInstanceId}
                    isAuthenticated={isAuthenticated}
                  />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </>
  );
};
