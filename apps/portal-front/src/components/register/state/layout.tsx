import { Button } from 'filigran-ui/servers';
import { useTranslations } from 'next-intl';
import React from 'react';

interface Props {
  children: React.ReactNode;
  cancel?: () => void;
  confirm?: () => void;
}

export const RegisterStateLayout: React.FC<Props> = ({
  children,
  cancel,
  confirm,
}) => {
  const t = useTranslations();
  return (
    <div className="h-full flex flex-col justify-between gap-xl">
      <div className="flex flex-col gap-m">{children}</div>
      <div className="flex justify-end gap-s">
        {Boolean(cancel) && (
          <Button
            variant="outline"
            onClick={cancel}>
            {t('Register.OCTI.Back')}
          </Button>
        )}
        {Boolean(confirm) && (
          <Button onClick={confirm}>{t('Utils.Confirm')}</Button>
        )}
      </div>
    </div>
  );
};
