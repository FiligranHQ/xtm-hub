import { RegistrationContext } from '@/components/registration/context';
import { RegistrationLayout } from '@/components/registration/layout';
import { useTranslations } from 'next-intl';
import React, { useContext, useEffect } from 'react';

interface Props {
  confirm: () => void;
}

export const UnregisterPlatformNotRegistered: React.FC<Props> = ({
  confirm,
}) => {
  const { translationKey } = useContext(RegistrationContext);
  const t = useTranslations();

  useEffect(() => {
    confirm();
  }, [confirm]);

  return (
    <RegistrationLayout>
      <h1>
        {t(`Unregister.${translationKey}.Error.PlatformNotRegistered.Title`)}
      </h1>
      <p>
        {t(
          `Unregister.${translationKey}.Error.PlatformNotRegistered.Description`
        )}
      </p>
    </RegistrationLayout>
  );
};
