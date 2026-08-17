'use client';
import { PlatformIdentifier } from '@graphql/generated';

import { PlatformMetadataMapping } from '@/components/registration/PlatformIdentifierMapping';
import React from 'react';

import { useTranslate } from '@tolgee/react';
interface TrialsHeaderProps {
  actions?: React.ReactNode;
  platformIdentifier?: PlatformIdentifier;
}

export const TrialsHeader = ({
  actions,
  platformIdentifier = PlatformIdentifier.Opencti,
}: TrialsHeaderProps) => {
  const { t } = useTranslate();
  const platformName = PlatformMetadataMapping[platformIdentifier].name;

  return (
    <header className="px-m pt-m pb-xxl text-center">
      <div className="flex flex-col gap-s">
        <p className="text-filigran-brand-primary font-bold">
          {t('Service_Trials_PageHeader_Welcome')}
        </p>
        <h1 className="heading-2xl">
          {t('Service_Trials_PageHeader_Title', { platformName })}
        </h1>
      </div>
      <div className="flex flex-wrap justify-center gap-s mt-l">{actions}</div>
    </header>
  );
};
