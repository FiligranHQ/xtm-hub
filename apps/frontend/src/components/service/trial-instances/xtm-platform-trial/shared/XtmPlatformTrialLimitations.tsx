'use client';

import { useTranslate } from '@/hooks/use-translate';
import { InfoIcon } from '@filigran/icon';

export const XtmPlatformTrialLimitations = () => {
  const t = useTranslate();
  return (
    <div className="rounded p-3 bg-feedback-info-secondary-transparency-30">
      <h2 className="flex items-center gap-2 mb-2 heading-xs">
        <InfoIcon className="size-4 text-feedback-info-primary" />
        {t('Service.Trials.XtmPlatform.Page.Limitations.Title')}
      </h2>
      <div className="pl-6 text-default-secondary">
        <p className="text-sm">
          {t('Service.Trials.XtmPlatform.Page.Limitations.Intro')}
        </p>
        <ul className="text-sm mb-4 list-disc pl-4">
          <li>{t('Service.Trials.XtmPlatform.Page.Limitations.OpenCTI')}</li>
          <li>{t('Service.Trials.XtmPlatform.Page.Limitations.OpenAEV')}</li>
        </ul>
        <p className="text-xs">
          {t('Service.Trials.XtmPlatform.Page.Limitations.Ingestion')}
        </p>
        <p className="text-xs">
          {t('Service.Trials.XtmPlatform.Page.Limitations.NoSLA')}
        </p>
      </div>
    </div>
  );
};
