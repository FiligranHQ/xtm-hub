import { getOrganization } from '@/components/organization/Organization.service';
import { RegistrationContext } from '@/components/registration/Context';
import { RegistrationLayout } from '@/components/registration/Layout';
import { useTranslations } from 'next-intl';
import { useContext } from 'react';

interface UnregisterConfirmProps {
  confirm: () => void;
  cancel: () => void;
  organizationId: string;
}

export const UnregisterConfirm = ({
  confirm,
  cancel,
  organizationId,
}: UnregisterConfirmProps) => {
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
