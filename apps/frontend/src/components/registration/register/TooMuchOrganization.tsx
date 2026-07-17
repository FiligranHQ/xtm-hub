import { RegistrationLayout } from '@/components/registration/Layout';
import { useTranslations } from 'next-intl';

interface RegisterStateTooMuchOrganizationProps {
  cancel: () => void;
  confirm: () => void;
  displayedIdentifier: string;
  platformTitle: string;
}

export const RegisterStateTooMuchOrganization = ({
  cancel,
  confirm,
  displayedIdentifier,
  platformTitle,
}: RegisterStateTooMuchOrganizationProps) => {
  const t = useTranslations();
  return (
    <RegistrationLayout
      cancel={cancel}
      confirm={confirm}>
      <h1>{t(`Register.TooMuchOrganization.Title`)}</h1>
      <p>
        {t(`Register.TooMuchOrganization.Description1`, {
          platformIdentifier: displayedIdentifier,
          platformTitle,
        })}
        <br />
        {t(`Register.TooMuchOrganization.Description2`)}
      </p>
    </RegistrationLayout>
  );
};
