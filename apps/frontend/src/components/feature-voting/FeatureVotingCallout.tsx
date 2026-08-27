'use client';

import { getFeatureVotingTheme } from '@/components/feature-voting/feature-voting-theme';
import { FeatureVotingCalloutQuery } from '@/components/feature-voting/feature-voting.graphql';
import usePublicPath from '@/hooks/use-public-path';
import {
  APP_PATH,
  PUBLIC_CYBERSECURITY_SOLUTIONS_PATH,
  XTM_PLATFORM_ROADMAP_SLUG,
} from '@/utils/path/constant';
import { CampaignIcon } from '@filigran/icon';
import { GradientButton } from '@filigran/ui/servers';
import { featureVotingCalloutQuery } from '@generated/featureVotingCalloutQuery.graphql';
import { ServiceDefinitionIdentifier } from '@graphql/generated';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { Suspense, useEffect } from 'react';
import { PreloadedQuery, usePreloadedQuery, useQueryLoader } from 'react-relay';

interface FeatureVotingCalloutProps {
  serviceInstanceId: string;
}

const FeatureVotingCalloutContent = ({
  queryRef,
  serviceInstanceId,
}: FeatureVotingCalloutProps & {
  queryRef: PreloadedQuery<featureVotingCalloutQuery>;
}) => {
  const t = useTranslations();
  const locale = useLocale();
  const isPublicPath = usePublicPath();
  const data = usePreloadedQuery<featureVotingCalloutQuery>(
    FeatureVotingCalloutQuery,
    queryRef
  );

  const round = data.currentVotingRound;
  if (!round) {
    return null;
  }

  // The voting page lives under the roadmap it belongs to, on both sides.
  const href = isPublicPath
    ? `/${locale}/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${XTM_PLATFORM_ROADMAP_SLUG}/feature-voting`
    : `/${APP_PATH}/service/${ServiceDefinitionIdentifier.XtmPlatformRoadmap}/${serviceInstanceId}/feature-voting`;

  const theme = getFeatureVotingTheme(round.theme);

  return (
    <div
      className={`mx-s mt-s mb-l flex flex-wrap items-center justify-between gap-m rounded border p-m ${theme.containerClassName}`}
      style={theme.containerStyle}>
      <div className="flex items-start gap-m">
        <CampaignIcon className="mt-xs size-5 shrink-0" />
        <div className="flex flex-col gap-xs">
          <p className={theme.titleClassName}>
            {t('FeatureVoting.CalloutTitle')}
          </p>
          <p className={theme.descriptionClassName}>
            {round.description ?? t('FeatureVoting.CalloutSubtitle')}
          </p>
        </div>
      </div>
      <GradientButton
        gradientFrom={theme.gradientFrom}
        gradientTo={theme.gradientTo}
        gradientBg={theme.gradientBg}>
        <Link href={href}>{t('FeatureVoting.CalloutButton')}</Link>
      </GradientButton>
    </div>
  );
};

/**
 * Teaser for the round open on that roadmap. Renders nothing while loading and
 * nothing when no round is collecting votes, so the roadmap never shows a call
 * to action that leads to an empty page.
 */
export const FeatureVotingCallout = ({
  serviceInstanceId,
}: FeatureVotingCalloutProps) => {
  const [queryRef, loadQuery] = useQueryLoader<featureVotingCalloutQuery>(
    FeatureVotingCalloutQuery
  );

  useEffect(() => {
    loadQuery(
      { service_instance_id: serviceInstanceId },
      { fetchPolicy: 'store-and-network' }
    );
  }, [loadQuery, serviceInstanceId]);

  if (!queryRef) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <FeatureVotingCalloutContent
        queryRef={queryRef}
        serviceInstanceId={serviceInstanceId}
      />
    </Suspense>
  );
};
