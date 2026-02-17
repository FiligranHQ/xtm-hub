'use client';
import { Callout } from '@filigran/ui';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export function PublicTryOpenCTIBanner() {
  const t = useTranslations();

  return (
    <Callout
      variant="destructive"
      className="rounded-none from-blue to-turquoise-300 bg-gradient-to-r text-black justify-center">
      <div>
        {t('Service.Trials.Explore')}
        <Link
          href={`/cybersecurity-solutions/free-trial`}
          className="ml-xs underline font-bold">
          {t('Service.Trials.LearnMore.Link')}
        </Link>
      </div>
    </Callout>
  );
}
