import Loader from '@/components/loader';
import { RegisterOrganizationForm } from '@/components/registration/register/organization-form';
import useMountingLoader from '@/hooks/useMountingLoader';
import OrganizationListUserOrganizationsQueryGraphql, {
  organizationListUserOrganizationsQuery,
} from '@generated/organizationListUserOrganizationsQuery.graphql';
import React from 'react';
import { useQueryLoader } from 'react-relay';

interface Props {
  cancel: () => void;
  confirm: (organizationId: string) => void;
}

export const RegisterNeverRegistered: React.FC<Props> = ({
  cancel,
  confirm,
}) => {
  const [queryRef, loadQuery] =
    useQueryLoader<organizationListUserOrganizationsQuery>(
      OrganizationListUserOrganizationsQueryGraphql
    );
  useMountingLoader(loadQuery, {});

  return queryRef ? (
    <RegisterOrganizationForm
      cancel={cancel}
      confirm={confirm}
      queryRef={queryRef}
    />
  ) : (
    <Loader />
  );
};
