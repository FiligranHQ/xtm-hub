'use client';

import { useTranslate } from '@/hooks/use-translate';
import React from 'react';

interface ShareableResourceBasicInformationProps {
  children: React.ReactNode;
}

export const ShareableResourceBasicInformation = ({
  children,
}: ShareableResourceBasicInformationProps) => {
  const t = useTranslate();
  return (
    <div className="flex-1">
      <h2 className="py-2 title-xs uppercase truncate text-ellipsis text-default-secondary">
        {t('Service.ShareableResources.Details.BasicInformation')}
      </h2>
      <section className="rounded layer-1 bg-elevation-default flex space-y-6 p-4">
        <div className="space-y-6">{children}</div>
      </section>
    </div>
  );
};
