import { RegistrationLayout } from '@/components/registration/Layout';
import { useTranslations } from 'next-intl';

interface RegisterStateConfirmReregistrationProps {
  cancel: () => void;
  confirm: () => void;
  displayedIdentifier: string;
  platformTitle: string;
  platformUrl: string;
  organizationName: string;
}

/**
 * A platform already registered asks before it is registered again: a new
 * registration issues a new token, sent to the platform URL shown here.
 */
export const RegisterStateConfirmReregistration = ({
  cancel,
  confirm,
  displayedIdentifier,
  platformTitle,
  platformUrl,
  organizationName,
}: RegisterStateConfirmReregistrationProps) => {
  const t = useTranslations();
  return (
    <RegistrationLayout
      cancel={cancel}
      confirm={confirm}>
      <h1>{t('Register.ConfirmReregistration.Title')}</h1>
      <p>
        {t('Register.ConfirmReregistration.Description', {
          platformIdentifier: displayedIdentifier,
          platformTitle,
          organizationName,
        })}
      </p>
      <p>{t('Register.Destination', { platformUrl })}</p>
    </RegistrationLayout>
  );
};
