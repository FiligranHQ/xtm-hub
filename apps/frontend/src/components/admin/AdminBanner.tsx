'use client';
import useAdminPath from '@/hooks/use-admin-path';
import { Callout } from '@filigran/ui';

import { useTranslate } from '@tolgee/react';
export const AdminBanner = () => {
  const { t } = useTranslate();
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
