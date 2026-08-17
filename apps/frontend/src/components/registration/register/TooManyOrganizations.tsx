import { RegistrationLayout } from '@/components/registration/Layout';
import { useTranslate } from '@tolgee/react';
interface RegisterStateTooManyOrganizationsProps {
  cancel: () => void;
  confirm: () => void;
  displayedIdentifier: string;
  platformTitle: string;
}

export const RegisterStateTooManyOrganizations = ({
  cancel,
  confirm,
  displayedIdentifier,
  platformTitle,
}: RegisterStateTooManyOrganizationsProps) => {
  const { t } = useTranslate();
  return (
    <RegistrationLayout
      cancel={cancel}
      confirm={confirm}>
      <h1>{t(`Register_TooManyOrganizations_Title`)}</h1>
      <p>
        {t(`Register_TooManyOrganizations_Description1`, {
          platformIdentifier: displayedIdentifier,
          platformTitle,
        })}
        <br />
        {t(`Register_TooManyOrganizations_Description2`)}
      </p>
    </RegistrationLayout>
  );
};
