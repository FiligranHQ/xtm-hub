'use client';
import { Button } from '@filigran/ui/servers';
import Link from 'next/link';

import { useTranslate } from '@tolgee/react';
export const SlackSupportButton = () => {
  const { t } = useTranslate();

  return (
    <Button>
      <Link
        href="https://community.filigran.io/"
        target="_blank"
        rel="noopener noreferrer">
        {t('Service_Trials_NeedSupport')}
      </Link>
    </Button>
  );
};
