import { getOrganization } from '@/components/organization/organization.service';
import { EnrollStateLayout } from '@/components/register/state/layout';
import { useTranslations } from 'next-intl';
import React from 'react';

interface Props {
  confirm: () => void;
  cancel: () => void;
  organizationId: string;
}

export const UnregisterOCTIConfirm: React.FC<Props> = ({
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
        {t('Unregister.OCTI.Confirm.Title', { name: organization?.name ?? '' })}
      </h1>
      <p>{t('Unregister.OCTI.Confirm.Description')}</p>
    </EnrollStateLayout>
  );
};
