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

const XtmRoadmap = async ({ locale }: { locale: PublicLocale }) => {
  const t = await getTranslations('PublicHomePage.XtmRoadmap');

  const data = await useEpicCountPerTimelineQueryQuery.fetcher(
    portalGraphqlClientCached
  )();

  const epicCounts = data.countEpicsPerTimeline;

  const roadmapStats = TIMELINE_CONFIG.map(({ timeline, ...config }) => ({
    count: epicCounts.find((e) => e.timeline === timeline)?.count ?? 0,
    ...config,
  }));

  return (
    <section className="grid grid-cols-[1fr_1fr_auto] gap-l items-center bg-card border border-primary/30 rounded-lg px-xl py-4">
      <div className="flex flex-col gap-l">
        <h2 className="text-2xl leading-tight">{t('Title')}</h2>
        <p className="text-muted-foreground text-sm xl:text-xs">
          {t('Description')}
        </p>
        <div>
          <Button
            asChild
            variant="outline"
            className="text-primary border-primary/20">
            <Link
              href={`/${locale}/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/xtm-platform-roadmap`}>
              {t('SeeMore')}
            </Link>
          </Button>
        </div>
      </div>

      <div className="relative h-24 mx-auto w-full rounded-lg overflow-hidden">
        <Image
          src="/xtm_roadmap_space.png"
          alt={t('ImageAlt')}
          fill
          className="object-contain"
        />
      </div>

      <div className="flex gap-l justify-end">
        {roadmapStats.map(({ count, labelKey, bg, text }) => (
          <div
            key={labelKey}
            className="flex flex-col gap-xs">
            <div className="flex items-center gap-s pr-8">
              <div className="relative w-6 h-6 flex items-center justify-center shrink-0">
                <div
                  className={`absolute inset-0 ${bg} opacity-20 rounded-full`}
                />
                <span className={`relative z-10 text-sm ${text}`}>{count}</span>
              </div>
              <span className={`text-m whitespace-nowrap ${text}`}>
                {t(labelKey)}
              </span>
            </div>
            <div
              className={`h-0.5 mt-xs w-full ${bg} opacity-70 rounded-full`}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default XtmRoadmap;
