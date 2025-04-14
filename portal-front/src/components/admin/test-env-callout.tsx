'use client';

import { getEnv } from '@/lib/utils';
import { Callout } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export function TestEnvCallout() {
  const t = useTranslations();
  const currentEnvironnement = getEnv();

  return (
    currentEnvironnement !== 'production' && (
      <Callout
        variant="destructive"
        className="rounded-none text-black justify-center uppercase">
        <div className="">
          {t('TestEnvCallout', {
            environnement: currentEnvironnement,
          })}
          <Link
            href="https://xtmhub.filigran.io/"
            className="ml-xs underline">
            {t('GoToProd')}
          </Link>
        </div>
      </Callout>
    )
  );
}
