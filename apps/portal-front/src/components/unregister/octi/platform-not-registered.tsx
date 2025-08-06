import { EnrollStateLayout } from '@/components/register/state/layout';
import { useTranslations } from 'next-intl';
import React, { useEffect } from 'react';

interface Props {
  confirm: () => void;
}

export const UnenrollOCTIPlatformNotEnrolled: React.FC<Props> = ({
  confirm,
}) => {
  const t = useTranslations();

  useEffect(() => {
    confirm();
  }, []);

  return (
    <EnrollStateLayout>
      <h1>{t('Unenroll.OCTI.Error.PlatformNotEnrolled.Title')}</h1>
      <p>{t('Unenroll.OCTI.Error.PlatformNotEnrolled.Description')}</p>
    </EnrollStateLayout>
  );
};
