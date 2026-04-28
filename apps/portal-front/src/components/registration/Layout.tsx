import { Button } from '@filigran/ui/servers';
import { useTranslations } from 'next-intl';
import React, { useContext } from 'react';
import { RegistrationContext } from './Context';

interface Props {
  children: React.ReactNode;
  cancel?: () => void;
  confirm?: () => void;
}

export const RegistrationLayout: React.FC<Props> = ({
  children,
  cancel,
  confirm,
}) => {
  const { displayedIdentifier } = useContext(RegistrationContext);
  const t = useTranslations();
  return (
    <div className="h-full flex flex-col justify-between gap-xl">
      <div className="flex flex-col gap-m">{children}</div>
      <div className="flex justify-end gap-s">
        {Boolean(cancel) && (
          <Button
            variant="outline"
            onClick={cancel}>
            {t(`Register.Back`, {
              platformIdentifier: displayedIdentifier,
            })}
          </Button>
        )}
        {Boolean(confirm) && (
          <Button onClick={confirm}>{t('Utils.Confirm')}</Button>
        )}
      </div>
    </div>
  );
};
