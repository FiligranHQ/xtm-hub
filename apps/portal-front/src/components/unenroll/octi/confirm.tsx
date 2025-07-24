import { EnrollStateLayout } from '@/components/enroll/state/layout';
import { getOrganization } from '@/components/organization/organization.service';
import { useTranslations } from 'next-intl';
import React from 'react';

interface Props {
  confirm: () => void;
  cancel: () => void;
  organizationId: string;
}

export const UnenrollOCTIConfirm: React.FC<Props> = ({
  confirm,
  cancel,
  organizationId,
}) => {
  const t = useTranslations();
  const organization = getOrganization(organizationId);

  return (
    <EnrollStateLayout
      confirm={confirm}
      cancel={cancel}>
      <h1>
        {t('Unenroll.OCTI.Confirm.Title', { name: organization?.name ?? '' })}
      </h1>
      <p>{t('Unenroll.OCTI.Confirm.Description')}</p>
    </EnrollStateLayout>
  );
};
