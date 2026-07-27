'use client';

import useAdminPath from '@/hooks/use-admin-path';
import { Callout } from '@filigran/ui';
import { useTranslations } from 'next-intl';

export const AdminBanner = () => {
  const t = useTranslations();
  const isAdminPath = useAdminPath();

  return (
    isAdminPath && (
      <Callout
        variant="warning"
        className="rounded-none justify-center uppercase">
        {t('AdminBanner')}
      </Callout>
    )
  );
};
