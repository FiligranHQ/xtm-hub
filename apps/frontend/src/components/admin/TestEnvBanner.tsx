'use client';
import { SettingsContext } from '@/components/settings/EnvPortalContext';
import { Callout } from '@filigran/ui';
import Link from 'next/link';
import { useContext } from 'react';

import { useTranslate } from '@tolgee/react';
export const TestEnvBanner = () => {
  const { t } = useTranslate();
  const { settings } = useContext(SettingsContext);

  return (
    settings?.environment &&
    settings.environment !== 'production' && (
      <Callout
        variant="destructive"
        className="rounded-none justify-center uppercase">
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
};
