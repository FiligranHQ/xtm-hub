import { Button } from 'filigran-ui/servers';
import { useTranslations } from 'next-intl';
import React from 'react';

interface Props {
  cancel: () => void;
}

export const EnrollStateAnotherOrganizationNotAllowed: React.FC<Props> = ({
  cancel,
}) => {
  const t = useTranslations();
  return (
    <div className="h-full flex flex-col justify-between">
      <div className="flex flex-col gap-m">
        <h1>{t('Enroll.OCTI.AnotherOrganization.NotAllowed.Title')}</h1>
        <p>{t('Enroll.OCTI.AnotherOrganization.NotAllowed.Description')}</p>
      </div>
      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={cancel}>
          {t('Enroll.OCTI.Back')}
        </Button>
      </div>
    </div>
  );
};
