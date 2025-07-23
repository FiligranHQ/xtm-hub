import { EnrollStateLayout } from '@/components/enroll/state/layout';
import { useTranslations } from 'next-intl';
import React, { useEffect } from 'react';

interface Props {
  confirm: () => void;
}

export const UnenrollOCTIInstanceNotEnrolled: React.FC<Props> = ({
  confirm,
}) => {
  const t = useTranslations();

  useEffect(() => {
    confirm();
  }, []);

  return (
    <EnrollStateLayout>
      <h1>{t('Unenroll.OCTI.Error.InstanceNotEnrolled.Title')}</h1>
      <p>{t('Unenroll.OCTI.Error.InstanceNotEnrolled.Description')}</p>
    </EnrollStateLayout>
  );
};
