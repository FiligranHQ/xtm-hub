'use client';

import { isMissingCapability } from '@/components/enroll/helper';
import { EnrollmentStatus } from '@/components/enroll/octi';
import { EnrollStateAllowed } from '@/components/enroll/state/allowed';
import { EnrollStateLayout } from '@/components/enroll/state/layout';
import { EnrollStateMissingCapability } from '@/components/enroll/state/missing-capability';
import { EnrollStateNotAllowed } from '@/components/enroll/state/not-allowed';
import Loader from '@/components/loader';
import useMountingLoader from '@/hooks/useMountingLoader';
import { enrollCanEnrollOCTIInstanceFragment$data } from '@generated/enrollCanEnrollOCTIInstanceFragment.graphql';
import UserListOrganizationAdministratorsQueryGraphql, {
  userListOrganizationAdministratorsQuery,
} from '@generated/userListOrganizationAdministratorsQuery.graphql';
import { useTranslations } from 'next-intl';
import React from 'react';
import { useQueryLoader } from 'react-relay';

interface Props {
  organizationId?: string;
  canEnrollState: enrollCanEnrollOCTIInstanceFragment$data;
  confirm: () => void;
  cancel: () => void;
  enrollmentStatus: EnrollmentStatus;
}

export const EnrollStateResult: React.FC<Props> = ({
  cancel,
  confirm,
  enrollmentStatus,
  organizationId,
  canEnrollState,
}) => {
  const t = useTranslations();
  const [queryRef, loadQuery] =
    useQueryLoader<userListOrganizationAdministratorsQuery>(
      UserListOrganizationAdministratorsQueryGraphql
    );

  useMountingLoader(loadQuery, { organizationId: organizationId });
  if (!organizationId) {
    return null;
  }

  if (
    !queryRef ||
    !canEnrollState ||
    (canEnrollState.status === 'never_enrolled' &&
      enrollmentStatus === 'idle' &&
      !isMissingCapability(canEnrollState))
  ) {
    return <Loader />;
  }

  if (enrollmentStatus === 'succeeded') {
    return (
      <EnrollStateLayout>
        <h1>{t('Enroll.OCTI.Succeeded.Title')}</h1>
        <p>{t('Enroll.OCTI.Succeeded.Description')}</p>
      </EnrollStateLayout>
    );
  }

  if (enrollmentStatus === 'failed') {
    return (
      <EnrollStateLayout cancel={cancel}>
        <h1>{t('Enroll.OCTI.Failed.Title')}</h1>
        <p>{t('Enroll.OCTI.Failed.Description')}</p>
      </EnrollStateLayout>
    );
  }

  if (isMissingCapability(canEnrollState)) {
    return (
      <EnrollStateMissingCapability
        cancel={cancel}
        queryRef={queryRef}
      />
    );
  }

  if (canEnrollState.isAllowed) {
    return (
      <EnrollStateAllowed
        cancel={cancel}
        confirm={confirm}
        state={canEnrollState}
      />
    );
  }

  return <EnrollStateNotAllowed cancel={cancel} />;
};
