'use client';
import { PlatformIdentifier } from '@graphql/generated';

import { PlatformMetadataMapping } from '@/components/registration/PlatformIdentifierMapping';
import { useTranslations } from 'next-intl';
import React from 'react';

interface TrialsHeaderProps {
  actions?: React.ReactNode;
  platformIdentifier?: PlatformIdentifier;
}

export const TrialsHeader = ({
  actions,
  platformIdentifier = PlatformIdentifier.Opencti,
}: TrialsHeaderProps) => {
  const t = useTranslations();
  const platformName = PlatformMetadataMapping[platformIdentifier].name;

  return (
    <header className="flex flex-col gap-m md:flex-row md:justify-between md:items-start my-xl">
      <div className="flex flex-col">
        <h2 className="text-blue text-xl md:text-2xl mb-2">
          {t('Service.Trials.PageHeader.Welcome')}
        </h2>
        <h1 className="text-2xl md:text-3xl">
          {t('Service.Trials.PageHeader.Title', { platformName })}
        </h1>
      </div>
      <div className="flex flex-wrap gap-s md:flex-nowrap md:shrink-0">
        {actions}
      </div>
    </header>
  );
};
