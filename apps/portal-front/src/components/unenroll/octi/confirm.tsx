import { EnrollStateLayout } from '@/components/enroll/state/layout';
import { useTranslations } from 'next-intl';
import React from 'react';

interface Props {
  confirm: () => void;
  cancel: () => void;
}

export const UnenrollOCTIConfirm: React.FC<Props> = ({ confirm, cancel }) => {
  const t = useTranslations();
  return (
    <EnrollStateLayout
      confirm={confirm}
      cancel={cancel}>
      <h1>{t('Unenroll.OCTI.Confirm.Title')}</h1>
      <p>{t('Unenroll.OCTI.Confirm.Description')}</p>
    </EnrollStateLayout>
  );
};
