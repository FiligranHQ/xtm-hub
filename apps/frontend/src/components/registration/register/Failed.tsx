import { RegistrationLayout } from '@/components/registration/Layout';
import { useTranslations } from 'next-intl';

interface RegisterStateFailedProps {
  cancel: () => void;
}

export const RegisterStateFailed = ({ cancel }: RegisterStateFailedProps) => {
  const t = useTranslations();
  return (
    <RegistrationLayout cancel={cancel}>
      <h1>{t(`Register.Failed.Title`)}</h1>
      <p>{t(`Register.Failed.Description`)}</p>
    </RegistrationLayout>
  );
};
