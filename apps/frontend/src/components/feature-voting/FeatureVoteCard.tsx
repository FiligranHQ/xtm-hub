'use client';

import { FeatureVoteButton } from '@/components/feature-voting/FeatureVoteButton';
import { Badge } from '@filigran/ui/servers';
import { VotableFeaturePublicFragment } from '@graphql/generated';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { MouseEvent, useCallback } from 'react';

const BADGE_CLASS =
  'border-0 content-body-compact-medium bg-feedback-info-secondary-transparency';

interface FeatureVoteCardProps {
  feature: VotableFeaturePublicFragment;
  isAuthenticated: boolean;
}

export const FeatureVoteCard = ({
  feature,
  isAuthenticated,
}: FeatureVoteCardProps) => {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const openDetail = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('featureId', feature.id);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [router, pathname, searchParams, feature.id]);

  // Clicking anywhere on the card is a mouse convenience only. Keyboard users
  // reach the detail through the "see details" button below, so the card stays
  // a plain container rather than a widget wrapping other widgets.
  const handleCardClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      const { currentTarget, target } = event;
      if (!(target instanceof Node) || !currentTarget.contains(target)) {
        return;
      }

      if (
        target instanceof HTMLElement &&
        target.closest('[data-no-open-detail]')
      ) {
        return;
      }

      openDetail();
    },
    [openDetail]
  );

  return (
    <div
      onClick={handleCardClick}
      className="flex h-full cursor-pointer flex-col overflow-hidden rounded bg-elevation-background-layer-1 hover:bg-hover">
      {feature.image_url && (
        <div className="relative h-32 w-full shrink-0">
          <Image
            src={feature.image_url}
            alt={feature.title}
            fill
            className="object-cover"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col gap-s p-m">
        <h3 className="text-base font-semibold leading-tight line-clamp-2">
          {feature.title}
        </h3>
        <p className="text-muted-foreground text-sm line-clamp-3">
          {feature.short_description}
        </p>
        {feature.labels.length > 0 && (
          <div className="flex flex-wrap items-center gap-s">
            {feature.labels.map((label) => (
              <Badge
                key={label}
                className={BADGE_CLASS}>
                {label}
              </Badge>
            ))}
          </div>
        )}
        <button
          type="button"
          onClick={openDetail}
          data-no-open-detail
          className="text-muted-foreground focus-visible:ring-primary w-fit text-xs underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2">
          {t('FeatureVoting.SeeDetails')}
        </button>
        {/* Voting must not open the detail dialog. */}
        <div
          className="mt-auto pt-s"
          data-no-open-detail>
          <FeatureVoteButton
            featureId={feature.id}
            hasMyVote={feature.has_my_vote}
            isAuthenticated={isAuthenticated}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};
