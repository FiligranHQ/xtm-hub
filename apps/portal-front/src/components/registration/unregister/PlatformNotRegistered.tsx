import { useTranslations } from 'next-intl';
import React, { useEffect } from 'react';
import { RegistrationLayout } from '@/components/registration/Layout';

interface Props {
  confirm: () => void;
}

export const UnregisterPlatformNotRegistered: React.FC<Props> = ({
  confirm,
}) => {
  const t = useTranslations();

  useEffect(() => {
    confirm();
  }, [confirm]);

  return (
    <RegistrationLayout>
      <h1>{t(`Unregister.Error.PlatformNotRegistered.Title`)}</h1>
      <p>{t(`Unregister.Error.PlatformNotRegistered.Description`)}</p>
    </RegistrationLayout>
  );
};
