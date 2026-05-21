import { PlatformMetadataMapping } from '@/components/registration/platform-identifier-mapping';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import { getTranslations } from 'next-intl/server';
import React from 'react';

interface TrialsHeaderProps {
  actions?: React.ReactNode;
  platformIdentifier?: PlatformIdentifierEnum;
}

export const TrialsHeader = async ({
  actions,
  platformIdentifier = PlatformIdentifierEnum.OPENCTI,
}: TrialsHeaderProps) => {
  const t = await getTranslations();
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
