import { getOrganization } from '@/components/organization/organization.service';
import { RegistrationContext } from '@/components/registration/context';
import { RegistrationLayout } from '@/components/registration/layout';
import { useTranslations } from 'next-intl';
import React, { useContext } from 'react';

interface Props {
  confirm: () => void;
  cancel: () => void;
  organizationId: string;
}

export const UnregisterConfirm: React.FC<Props> = ({
  confirm,
  cancel,
  organizationId,
}) => {
  const { displayedIdentifier } = useContext(RegistrationContext);
  const t = useTranslations();
  const organization = getOrganization(organizationId);

  return (
    <RegistrationLayout
      confirm={confirm}
      cancel={cancel}>
      <h1>
        {t(`Unregister.Confirm.Title`, {
          platformIdentifier: displayedIdentifier,
          name: organization?.name ?? '',
        })}
      </h1>
      <p>{t(`Unregister.Confirm.Description`)}</p>
    </RegistrationLayout>
  );
};
