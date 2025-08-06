import { EnrollStateLayout } from '@/components/register/state/layout';
import { useTranslations } from 'next-intl';
import React, { useEffect } from 'react';

interface Props {
  confirm: () => void;
}

export const UnregisterOCTIPlatformNotEnrolled: React.FC<Props> = ({
  confirm,
}) => {
  const t = useTranslations();

  useEffect(() => {
    confirm();
  }, []);

  return (
    <EnrollStateLayout>
      <h1>{t('Unregister.OCTI.Error.PlatformNotEnrolled.Title')}</h1>
      <p>{t('Unregister.OCTI.Error.PlatformNotEnrolled.Description')}</p>
    </EnrollStateLayout>
  );
};
