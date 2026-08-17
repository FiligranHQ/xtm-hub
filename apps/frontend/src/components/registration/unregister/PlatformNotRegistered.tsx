import { RegistrationLayout } from '@/components/registration/Layout';
import { useTranslate } from '@tolgee/react';
import { useEffect } from 'react';
interface UnregisterPlatformNotRegisteredProps {
  confirm: () => void;
}

export const UnregisterPlatformNotRegistered = ({
  confirm,
}: UnregisterPlatformNotRegisteredProps) => {
  const { t } = useTranslate();

  useEffect(() => {
    confirm();
  }, [confirm]);

  return (
    <RegistrationLayout>
      <h1>{t(`Unregister_Error_PlatformNotRegistered_Title`)}</h1>
      <p>{t(`Unregister_Error_PlatformNotRegistered_Description`)}</p>
    </RegistrationLayout>
  );
};
