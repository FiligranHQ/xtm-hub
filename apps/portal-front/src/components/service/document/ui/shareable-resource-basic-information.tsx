import { useTranslations } from 'next-intl';
import React from 'react';

interface Props {
  children: React.ReactNode;
}

export const ShareableResourceBasicInformation: React.FC<Props> = ({
  children,
}) => {
  const t = useTranslations();
  return (
    <div className="flex-1">
      <h2 className="py-s txt-container-title truncate text-ellipsis text-muted-foreground">
        {t('Service.ShareableResources.Details.BasicInformation')}
      </h2>
      <section className="border rounded border-border-light bg-page-background flex space-y-xl p-l">
        <div className="space-y-xl">{children}</div>
      </section>
    </div>
  );
};
