'use client';

import { Callout } from '@filigran/ui';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useContext } from 'react';
import { SettingsContext } from '../settings/EnvPortalContext';

export function TestEnvBanner() {
  const t = useTranslations();
  const { settings } = useContext(SettingsContext);

  return (
    settings?.environment &&
    settings.environment !== 'production' && (
      <Callout
        variant="destructive"
        className="rounded-none text-black justify-center uppercase">
        <div className="">
          {t('TestEnvBanner', {
            environnement: settings?.environment,
          })}
          <Link
            href="https://hub.filigran.io/"
            className="ml-xs underline">
            {t('GoToProd')}
          </Link>
        </div>
      </Callout>
    )
  );
}
