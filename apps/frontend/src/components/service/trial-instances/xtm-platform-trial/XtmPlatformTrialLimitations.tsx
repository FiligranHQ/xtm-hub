'use client';

import { InfoIcon } from '@filigran/icon';
import { useTranslations } from 'next-intl';

export const XtmPlatformTrialLimitations = () => {
  const t = useTranslations('Service.Trials.XtmPlatform.Page.Limitations');

  return (
    <div className="rounded p-6 bg-elevation-background-layer-1">
      <h3 className="flex items-center gap-s text-primary mb-s font-bold">
        <InfoIcon className="size-4" />
        {t('Title')}
      </h3>
      <p className="text-sm mb-s">{t('Intro')}</p>
      <ul className="text-sm mb-l list-disc pl-l">
        <li>{t('OpenCTI')}</li>
        <li>{t('OpenAEV')}</li>
      </ul>
      <p className="text-sm">{t('Ingestion')}</p>
      <p className="text-sm">{t('NoSLA')}</p>
    </div>
  );
};
