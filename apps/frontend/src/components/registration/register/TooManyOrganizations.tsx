import { RegistrationLayout } from '@/components/registration/Layout';
import { useTranslations } from 'next-intl';

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
  const t = useTranslations();
  return (
    <RegistrationLayout
      cancel={cancel}
      confirm={confirm}>
      <h1>{t(`Register.TooManyOrganizations.Title`)}</h1>
      <p>
        {t(`Register.TooManyOrganizations.Description1`, {
          platformIdentifier: displayedIdentifier,
          platformTitle,
        })}
        <br />
        {t(`Register.TooManyOrganizations.Description2`)}
      </p>
    </RegistrationLayout>
  );
};
