'use client';

import { PortalContext } from '@/components/me/app-portal-context';
import { Callout } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useContext } from 'react';

export function TestEnvCallout() {
  const t = useTranslations();
  const { settings } = useContext(PortalContext);

  return (
    settings?.environment !== 'production' && (
      <Callout
        variant="destructive"
        className="rounded-none text-black justify-center uppercase">
        <div className="">
          {t('TestEnvCallout', {
            environnement: settings?.environment,
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
