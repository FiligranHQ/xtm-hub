import { RegistrationLayout } from '@/components/registration/Layout';
import { useTranslate } from '@tolgee/react';
interface RegisterStateSucceededProps {
  displayedIdentifier: string;
}

export const RegisterStateSucceeded = ({
  displayedIdentifier,
}: RegisterStateSucceededProps) => {
  const { t } = useTranslate();
  return (
    <RegistrationLayout>
      <h1>
        {t(`Register_Succeeded_Title`, {
          platformIdentifier: displayedIdentifier,
        })}
      </h1>
      <p>{t(`Register_Succeeded_Description`)}</p>
    </RegistrationLayout>
  );
};
