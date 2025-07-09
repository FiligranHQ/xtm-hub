import { EnrollmentState } from '@/components/enroll/octi';
import { Button } from 'filigran-ui/servers';
import { useTranslations } from 'next-intl';
import React from 'react';

interface Props {
  state: EnrollmentState;
  confirm: () => void;
  cancel: () => void;
}

export const EnrollStateAnotherOrganizationAllowed: React.FC<Props> = ({
  cancel,
  confirm,
  state,
}) => {
  const t = useTranslations();
  const translationKey =
    state.status === 'enrolled' ? 'Enrolled' : 'Unenrolled';
  const title = t(
    `Enroll.OCTI.AnotherOrganization.Allowed.${translationKey}.Title`
  );
  const description = t(
    `Enroll.OCTI.AnotherOrganization.Allowed.${translationKey}.Description`
  );
  return (
    <div className="h-full flex flex-col justify-between">
      <div className="flex flex-col gap-m">
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className="flex justify-end gap-s">
        <Button
          variant="outline"
          onClick={cancel}>
          {t('Utils.Cancel')}
        </Button>
        <Button onClick={confirm}>{t('Utils.Confirm')}</Button>
      </div>
    </div>
  );
};
