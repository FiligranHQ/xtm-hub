'use client';

import { isMissingCapability } from '@/components/enroll/helper';
import { EnrollStateAllowed } from '@/components/enroll/state/allowed';
import { EnrollStateLayout } from '@/components/enroll/state/layout';
import { EnrollStateMissingCapability } from '@/components/enroll/state/missing-capability';
import { EnrollStateNotAllowed } from '@/components/enroll/state/not-allowed';
import Loader from '@/components/loader';
import useMountingLoader from '@/hooks/useMountingLoader';
import { enrollCanEnrollOCTIInstanceQuery$data } from '@generated/enrollCanEnrollOCTIInstanceQuery.graphql';
import UserListOrganizationAdministratorsQueryGraphql, {
  userListOrganizationAdministratorsQuery,
} from '@generated/userListOrganizationAdministratorsQuery.graphql';
import { useTranslations } from 'next-intl';
import React from 'react';
import { useQueryLoader } from 'react-relay';

interface Props {
  organizationId?: string;
  state: enrollCanEnrollOCTIInstanceQuery$data['canEnrollOCTIInstance'];
  confirm: () => void;
  cancel: () => void;
  isSuccess: boolean;
}

export const EnrollStateResult: React.FC<Props> = ({
  cancel,
  confirm,
  isSuccess,
  organizationId,
  state,
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

  if (!queryRef || !state) {
    return <Loader />;
  }

  if (isSuccess) {
    return (
      <EnrollStateLayout>
        <h1>{t('Enroll.OCTI.Success.Title')}</h1>
        <p>{t('Enroll.OCTI.Success.Description')}</p>
      </EnrollStateLayout>
    );
  }

  if (isMissingCapability(state)) {
    return (
      <EnrollStateMissingCapability
        cancel={cancel}
        queryRef={queryRef}
      />
    );
  }

  if (state.allowed) {
    return (
      <EnrollStateAllowed
        cancel={cancel}
        confirm={confirm}
        state={state}
      />
    );
  }

  return <EnrollStateNotAllowed cancel={cancel} />;
};
