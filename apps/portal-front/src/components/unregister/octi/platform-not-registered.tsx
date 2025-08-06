import { RegisterStateLayout } from '@/components/register/state/layout';
import { useTranslations } from 'next-intl';
import React, { useEffect } from 'react';

interface Props {
  confirm: () => void;
}

export const UnregisterOCTIPlatformNotRegistered: React.FC<Props> = ({
  confirm,
}) => {
  const t = useTranslations();

  useEffect(() => {
    confirm();
  }, []);

  return (
    <RegisterStateLayout>
      <h1>{t('Unregister.OCTI.Error.PlatformNotRegistered.Title')}</h1>
      <p>{t('Unregister.OCTI.Error.PlatformNotRegistered.Description')}</p>
    </RegisterStateLayout>
  );
};
