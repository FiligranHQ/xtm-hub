import { RegistrationLayout } from '@/components/registration/Layout';
import { useTranslate } from '@/hooks/use-translate';

interface RegisterStateSucceededProps {
  displayedIdentifier: string;
  /** The token the platform could not receive (its window was closed). */
  token?: string | null;
}

export const RegisterStateSucceeded = ({
  displayedIdentifier,
  token,
}: RegisterStateSucceededProps) => {
  const t = useTranslate();
  return (
    <RegistrationLayout>
      <h1>
        {t(`Register.Succeeded.Title`, {
          platformIdentifier: displayedIdentifier,
        })}
      </h1>
      {token ? (
        <>
          <p>
            {t('Register.Succeeded.CopyToken', {
              platformIdentifier: displayedIdentifier,
            })}
          </p>
          <code
            className="block select-all break-all rounded border p-2"
            data-testid="registration-token">
            {token}
          </code>
        </>
      ) : (
        <p>{t(`Register.Succeeded.Description`)}</p>
      )}
    </RegistrationLayout>
  );
};
