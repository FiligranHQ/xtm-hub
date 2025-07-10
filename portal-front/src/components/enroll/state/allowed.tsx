import { EnrollStateLayout } from '@/components/enroll/state/layout';
import { enrollCanEnrollOCTIInstanceQuery$data } from '@generated/enrollCanEnrollOCTIInstanceQuery.graphql';
import { useTranslations } from 'next-intl';
import React from 'react';

interface Props {
  state: enrollCanEnrollOCTIInstanceQuery$data['canEnrollOCTIInstance'];
  confirm: () => void;
  cancel: () => void;
}

const buildTranslationKey = (
  state: enrollCanEnrollOCTIInstanceQuery$data['canEnrollOCTIInstance']
): string => {
  const enrollmentKey =
    state?.status === 'enrolled' ? 'Enrolled' : 'Unenrolled';
  const organizationKey = state?.sameOrganization
    ? 'SameOrganization'
    : 'AnotherOrganization.Allowed';
  return `${organizationKey}.${enrollmentKey}`;
};

export const EnrollStateAllowed: React.FC<Props> = ({
  cancel,
  confirm,
  state,
}) => {
  const t = useTranslations();
  const translationKey = buildTranslationKey(state);
  const title = t(`Enroll.OCTI.${translationKey}.Title`);
  const description = t(`Enroll.OCTI.${translationKey}.Description`);

  return (
    <EnrollStateLayout
      cancel={cancel}
      confirm={confirm}>
      <h1>{title}</h1>
      <p>{description}</p>
    </EnrollStateLayout>
  );
};
