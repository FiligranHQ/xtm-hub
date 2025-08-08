import { getOrganization } from '@/components/organization/organization.service';
import { RegisterStateLayout } from '@/components/register/state/layout';
import { useTranslations } from 'next-intl';
import React from 'react';

interface Props {
  confirm: () => void;
  cancel: () => void;
  organizationId: string;
}

export const UnregisterOpenCTIConfirm: React.FC<Props> = ({
  confirm,
  cancel,
  organizationId,
}) => {
  const t = useTranslations();
  const organization = getOrganization(organizationId);

  return (
    <RegisterStateLayout
      confirm={confirm}
      cancel={cancel}>
      <h1>
        {t('Unregister.OpenCTI.Confirm.Title', {
          name: organization?.name ?? '',
        })}
      </h1>
      <p>{t('Unregister.OpenCTI.Confirm.Description')}</p>
    </RegisterStateLayout>
  );
};
