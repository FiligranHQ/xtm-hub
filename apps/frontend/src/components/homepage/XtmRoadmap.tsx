import type { HomepageRoadmapTitleProduct } from '@/components/homepage/Homepage.utils';
import type { PublicLocale } from '@/i18n/config';
import { portalGraphqlClientCached } from '@/lib/graphql-client';
import { PUBLIC_CYBERSECURITY_SOLUTIONS_PATH } from '@/utils/path/constant';
import { Button } from '@filigran/ui/servers';
import {
  Timeline,
  useEpicCountPerTimelineQueryQuery,
} from '@graphql/generated';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import Link from 'next/link';

const TIMELINE_CONFIG = [
  {
    timeline: Timeline.Now,
    labelKey: 'Now' as const,
    bg: 'bg-orange',
    text: 'text-orange',
  },
  {
    timeline: Timeline.Next,
    labelKey: 'Next' as const,
    bg: 'bg-primary',
    text: 'text-primary',
  },
  {
    timeline: Timeline.UnderConsideration,
    labelKey: 'UnderConsideration' as const,
    bg: 'bg-green',
    text: 'text-green',
  },
];

export type XtmRoadmapProps = {
  locale: PublicLocale;
  seeMoreHref?: string;
  titleProduct?: HomepageRoadmapTitleProduct;
};

const XtmRoadmap = async ({
  locale,
  seeMoreHref,
  titleProduct = 'default',
}: XtmRoadmapProps) => {
  const t = await getTranslations('PublicHomePage.XtmRoadmap');
  const tPlatformIdentifier = await getTranslations('PlatformIdentifier');

  const title =
    titleProduct === 'default'
      ? t('Title')
      : t('TitleWithProduct', {
          product:
            titleProduct === 'opencti'
              ? tPlatformIdentifier('opencti')
              : tPlatformIdentifier('openaev'),
        });

  const data = await useEpicCountPerTimelineQueryQuery.fetcher(
    portalGraphqlClientCached
  )();

  const epicCounts = data.countEpicsPerTimeline;

  const roadmapStats = TIMELINE_CONFIG.map(({ timeline, ...config }) => ({
    count: epicCounts.find((e) => e.timeline === timeline)?.count ?? 0,
    ...config,
  }));

  const defaultSeeMoreHref = `/${locale}/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/xtm-platform-roadmap`;

  return (
    <section className="flex flex-col lg:flex-row gap-l items-center bg-card border border-primary/30 rounded-lg px-xl py-4">
      <div className="flex flex-col gap-l flex-3">
        <h2 className="text-xl leading-tight">{title}</h2>
        <p className="text-muted-foreground text-sm min-[1330px]:text-xs">
          {t('Description')}
        </p>
        <div>
          <Button
            asChild
            variant="outline"
            className="text-primary border-primary/20">
            <Link href={seeMoreHref ?? defaultSeeMoreHref}>{t('SeeMore')}</Link>
          </Button>
        </div>
      </div>

      <div className="hidden min-[1330px]:block relative h-24 flex-2 rounded-lg overflow-hidden">
        <Image
          src="/xtm_roadmap_space.png"
          alt={t('ImageAlt')}
          fill
          sizes="33vw"
          className="object-contain"
        />
      </div>

      <div className="flex gap-l max-md:gap-m max-sm:gap-xs justify-center lg:justify-end">
        {roadmapStats.map(({ count, labelKey, bg, text }) => (
          <div
            key={labelKey}
            className="flex flex-col gap-xs max-sm:gap-[2px]">
            <div className="flex items-center gap-s max-md:gap-xs max-sm:gap-[4px] pr-8 max-md:pr-5 max-sm:pr-1">
              <div className="relative w-6 h-6 max-md:w-5 max-md:h-5 max-sm:w-4 max-sm:h-4 flex items-center justify-center shrink-0">
                <div
                  className={`absolute inset-0 ${bg} opacity-20 rounded-full`}
                />
                <span
                  className={`relative z-10 text-sm max-md:text-xs max-sm:text-[10px] ${text}`}>
                  {count}
                </span>
              </div>
              <span
                className={`text-m max-md:text-sm max-sm:text-xs whitespace-nowrap ${text}`}>
                {t(labelKey)}
              </span>
            </div>
            <div
              className={`h-0.5 mt-xs max-sm:mt-px w-full ${bg} opacity-70 rounded-full`}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default XtmRoadmap;
