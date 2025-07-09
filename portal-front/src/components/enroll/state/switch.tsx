'use client';

import { isMissingCapability } from '@/components/enroll/helper';
import { EnrollmentState } from '@/components/enroll/octi';
import { EnrollStateAnotherOrganizationAllowed } from '@/components/enroll/state/another-organization/allowed';
import { EnrollStateAnotherOrganizationNotAllowed } from '@/components/enroll/state/another-organization/not-allowed';
import { EnrollStateMissingCapability } from '@/components/enroll/state/missing-capability';
import { EnrollStateSameOrganization } from '@/components/enroll/state/same-organization';
import Loader from '@/components/loader';
import useMountingLoader from '@/hooks/useMountingLoader';
import UserListOrganizationAdministratorsQueryGraphql, {
  userListOrganizationAdministratorsQuery,
} from '@generated/userListOrganizationAdministratorsQuery.graphql';
import React from 'react';
import { useQueryLoader } from 'react-relay';

interface Props {
  organizationId?: string;
  state: EnrollmentState;
  confirm: () => void;
  cancel: () => void;
}

export const EnrollStateSwitch: React.FC<Props> = ({
  cancel,
  confirm,
  organizationId,
  state,
}) => {
  const [queryRef, loadQuery] =
    useQueryLoader<userListOrganizationAdministratorsQuery>(
      UserListOrganizationAdministratorsQueryGraphql
    );

  useMountingLoader(loadQuery, { organizationId: organizationId });

  if (!organizationId) {
    return null;
  }

  if (!queryRef) {
    return <Loader />;
  }

  if (isMissingCapability(state)) {
    return <EnrollStateMissingCapability queryRef={queryRef} />;
  }

  if (state.sameOrganization) {
    return (
      <EnrollStateSameOrganization
        cancel={cancel}
        confirm={confirm}
        state={state}
      />
    );
  }

  if (!state.allowed) {
    return <EnrollStateAnotherOrganizationNotAllowed cancel={cancel} />;
  }

  return (
    <EnrollStateAnotherOrganizationAllowed
      cancel={cancel}
      confirm={confirm}
      state={state}
    />
  );
};
