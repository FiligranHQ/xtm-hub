import { RegisterStateLayout } from '@/components/register/state/layout';
import { useTranslations } from 'next-intl';
import React, { useEffect } from 'react';

interface Props {
  confirm: () => void;
}

export const UnregisterOpenCTIPlatformNotRegistered: React.FC<Props> = ({
  confirm,
}) => {
  const t = useTranslations();

  useEffect(() => {
    confirm();
  }, [confirm]);

  return (
    <RegisterStateLayout>
      <h1>{t('Unregister.OpenCTI.Error.PlatformNotRegistered.Title')}</h1>
      <p>{t('Unregister.OpenCTI.Error.PlatformNotRegistered.Description')}</p>
    </RegisterStateLayout>
  );
};
