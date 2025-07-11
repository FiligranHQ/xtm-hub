'use client';

import { Callout } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import useAdminPath from '../../hooks/useAdminPath';

export function AdminCallout() {
  const t = useTranslations();
  const isAdminPath = useAdminPath();

  return (
    isAdminPath && (
      <Callout
        variant="warning"
        className="rounded-none text-black justify-center uppercase">
        {t('AdminCallout')}
      </Callout>
    )
  );
}
