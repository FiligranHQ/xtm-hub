import { RegistrationContext } from '@/components/registration/Context';
import { useTranslate } from '@/hooks/use-translate';
import { Button } from '@filigran/design-system';
import React, { useContext } from 'react';

interface RegistrationLayoutProps {
  children: React.ReactNode;
  cancel?: () => void;
  confirm?: () => void;
}

export const RegistrationLayout = ({
  children,
  cancel,
  confirm,
}: RegistrationLayoutProps) => {
  const { displayedIdentifier } = useContext(RegistrationContext);
  const t = useTranslate();
  return (
    <div className="h-full flex flex-col justify-between gap-6">
      <div className="flex flex-col gap-3">{children}</div>
      <div className="flex justify-end gap-2">
        {Boolean(cancel) && (
          <Button
            priority="secondary"
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
