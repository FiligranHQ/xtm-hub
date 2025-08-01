import { EnrollOrganizationForm } from '@/components/enroll/form/organization';
import Loader from '@/components/loader';
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

export const EnrollNeverEnrolled: React.FC<Props> = ({ cancel, confirm }) => {
  const [queryRef, loadQuery] =
    useQueryLoader<organizationListUserOrganizationsQuery>(
      OrganizationListUserOrganizationsQueryGraphql
    );
  useMountingLoader(loadQuery, {});

  return queryRef ? (
    <EnrollOrganizationForm
      cancel={cancel}
      confirm={confirm}
      queryRef={queryRef}
    />
  ) : (
    <Loader />
  );
};
