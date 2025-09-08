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
  const { translationKey } = useContext(RegistrationContext);
  const t = useTranslations();
  const organization = getOrganization(organizationId);

  return (
    <RegistrationLayout
      confirm={confirm}
      cancel={cancel}>
      <h1>
        {t(`Unregister.${translationKey}.Confirm.Title`, {
          name: organization?.name ?? '',
        })}
      </h1>
      <p>{t(`Unregister.${translationKey}.Confirm.Description`)}</p>
    </RegistrationLayout>
  );
};
