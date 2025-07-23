import { EnrollStateLayout } from '@/components/enroll/state/layout';
import { enrollCanEnrollOCTIInstanceFragment$data } from '@generated/enrollCanEnrollOCTIInstanceFragment.graphql';
import { CanEnrollStatusEnum } from '@generated/models/CanEnrollStatus.enum';
import { useTranslations } from 'next-intl';
import React from 'react';

interface Props {
  state: enrollCanEnrollOCTIInstanceFragment$data;
  confirm: () => void;
  cancel: () => void;
}

const buildTranslationKey = (
  state: enrollCanEnrollOCTIInstanceFragment$data
): string => {
  const enrollmentKey =
    state?.status === CanEnrollStatusEnum.ENROLLED ? 'Enrolled' : 'Unenrolled';
  const organizationKey = state?.isSameOrganization
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
