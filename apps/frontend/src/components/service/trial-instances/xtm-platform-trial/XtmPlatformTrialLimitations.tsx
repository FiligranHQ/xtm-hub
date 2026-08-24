'use client';

import { InfoIcon } from '@filigran/icon';
import { useTranslations } from 'next-intl';

export const XtmPlatformTrialLimitations = () => {
  const t = useTranslations();
  return (
    <div className="rounded p-6 bg-elevation-background-layer-1">
      <h2 className="flex items-center gap-s mb-s heading-xs">
        <InfoIcon className="size-4" />
        {t('Service.Trials.XtmPlatform.Page.Limitations.Title')}
      </h2>
      <p className="text-sm mb-s">
        {t('Service.Trials.XtmPlatform.Page.Limitations.Intro')}
      </p>
      <ul className="text-sm mb-l list-disc pl-l">
        <li>{t('Service.Trials.XtmPlatform.Page.Limitations.OpenCTI')}</li>
        <li>{t('Service.Trials.XtmPlatform.Page.Limitations.OpenAEV')}</li>
      </ul>
      <p className="text-sm">
        {t('Service.Trials.XtmPlatform.Page.Limitations.Ingestion')}
      </p>
      <p className="text-sm">
        {t('Service.Trials.XtmPlatform.Page.Limitations.NoSLA')}
      </p>
    </div>
  );
};
