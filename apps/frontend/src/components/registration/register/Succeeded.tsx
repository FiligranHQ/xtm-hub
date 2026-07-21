import { RegistrationLayout } from '@/components/registration/Layout';
import { useTranslations } from 'next-intl';

interface RegisterStateSucceededProps {
  displayedIdentifier: string;
}

export const RegisterStateSucceeded = ({
  displayedIdentifier,
}: RegisterStateSucceededProps) => {
  const t = useTranslations();
  return (
    <RegistrationLayout>
      <h1>
        {t(`Register.Succeeded.Title`, {
          platformIdentifier: displayedIdentifier,
        })}
      </h1>
      <p>{t(`Register.Succeeded.Description`)}</p>
    </RegistrationLayout>
  );
};
