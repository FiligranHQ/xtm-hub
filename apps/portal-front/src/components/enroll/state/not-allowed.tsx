import { EnrollStateLayout } from '@/components/enroll/state/layout';
import { useTranslations } from 'next-intl';
import React from 'react';

interface Props {
  cancel: () => void;
}

export const EnrollStateNotAllowed: React.FC<Props> = ({ cancel }) => {
  const t = useTranslations();
  return (
    <EnrollStateLayout cancel={cancel}>
      <h1>{t('Enroll.OCTI.AnotherOrganization.NotAllowed.Title')}</h1>
      <p>{t('Enroll.OCTI.AnotherOrganization.NotAllowed.Description')}</p>
    </EnrollStateLayout>
  );
};
