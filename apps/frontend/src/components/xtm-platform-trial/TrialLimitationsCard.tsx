'use client';

import { InfoIcon } from '@filigran/icon';
import { useTranslations } from 'next-intl';

export const TrialLimitationsCard = () => {
  const tLimitations = useTranslations('XtmPlatformTrial.Limitations');

  return (
    <div className="flex gap-m rounded-lg bg-feedback-info-secondary-transparency p-xs">
      <InfoIcon className="h-5 w-5 shrink-0 text-feedback-info-primary" />
      <div className="flex flex-col gap-s">
        <h2 className="text-header-heading-xs">{tLimitations('Title')}</h2>
        <div className="flex flex-col gap-s text-content-body-compact text-text-default-secondary">
          <p>{tLimitations('Intro')}</p>
          <ul className="list-disc pl-l">
            <li>{tLimitations('Opencti')}</li>
            <li>{tLimitations('Openaev')}</li>
          </ul>
          <p>{tLimitations('Warning')}</p>
        </div>
      </div>
    </div>
  );
};
