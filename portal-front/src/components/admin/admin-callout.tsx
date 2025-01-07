'use client';

import { Callout } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import useAdminPath from '../../hooks/useAdminPath';

export function AdminCallout() {
  const t = useTranslations();
  const isAdminPath = useAdminPath();

  useEffect(() => {
    if (isAdminPath) {
      document.body.classList.add('!pt-9');
    } else {
      document.body.classList.remove('!pt-9');
    }

    return () => document.body.classList.remove('!pt-9');
  }, [isAdminPath]);

  return (
    isAdminPath && (
      <Callout
        variant="warning"
        className="absolute z-50 top-0 left-0 right-0 rounded-none !text-black">
        {t('AdminCallout')}
      </Callout>
    )
  );
}
