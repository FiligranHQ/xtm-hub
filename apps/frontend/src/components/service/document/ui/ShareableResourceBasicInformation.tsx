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
      <h2 className="py-2 txt-container-title truncate text-ellipsis text-default-secondary">
        {t('Service.ShareableResources.Details.BasicInformation')}
      </h2>
      <section className="rounded bg-[var(--bg-elevation-default-layer-1)] flex space-y-6 p-4">
        <div className="space-y-6">{children}</div>
      </section>
    </div>
  );
};
