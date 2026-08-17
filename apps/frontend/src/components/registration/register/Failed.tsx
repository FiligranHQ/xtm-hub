import { RegistrationLayout } from '@/components/registration/Layout';
import { useTranslate } from '@tolgee/react';
interface RegisterStateFailedProps {
  cancel: () => void;
}

export const RegisterStateFailed = ({ cancel }: RegisterStateFailedProps) => {
  const { t } = useTranslate();
  return (
    <RegistrationLayout cancel={cancel}>
      <h1>{t(`Register_Failed_Title`)}</h1>
      <p>{t(`Register_Failed_Description`)}</p>
    </RegistrationLayout>
  );
};
