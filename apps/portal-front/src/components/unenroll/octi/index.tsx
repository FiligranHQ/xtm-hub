import { CanUnenrollOCTIInstanceFragment } from '@/components/enroll/enroll.graphql';
import Loader from '@/components/loader';
import { UnenrollOCTIMissingCapability } from '@/components/unenroll/octi/missing-capability';
import useMountingLoader from '@/hooks/useMountingLoader';
import { enrollCanUnenrollOCTIInstanceFragment$key } from '@generated/enrollCanUnenrollOCTIInstanceFragment.graphql';
import EnrollCanUnenrollOCTIInstanceQueryGraphql, {
  enrollCanUnenrollOCTIInstanceQuery,
} from '@generated/enrollCanUnenrollOCTIInstanceQuery.graphql';
import UserListOrganizationAdministratorsQueryGraphql, {
  userListOrganizationAdministratorsQuery,
} from '@generated/userListOrganizationAdministratorsQuery.graphql';
import React from 'react';
import {
  PreloadedQuery,
  useFragment,
  usePreloadedQuery,
  useQueryLoader,
} from 'react-relay';

interface Props {
  platformId: string;
  queryRef: PreloadedQuery<enrollCanUnenrollOCTIInstanceQuery>;
}

export const UnenrollOCTI: React.FC<Props> = ({ queryRef, platformId }) => {
  const canUnenrollPreloadedQuery =
    usePreloadedQuery<enrollCanUnenrollOCTIInstanceQuery>(
      EnrollCanUnenrollOCTIInstanceQueryGraphql,
      queryRef
    );

  const { isAllowed, organizationId } =
    useFragment<enrollCanUnenrollOCTIInstanceFragment$key>(
      CanUnenrollOCTIInstanceFragment,
      canUnenrollPreloadedQuery.canUnenrollOCTIInstance
    );

  const [
    organizationAdministratorsQueryRef,
    loadOrganizationAdministratorsQuery,
  ] = useQueryLoader<userListOrganizationAdministratorsQuery>(
    UserListOrganizationAdministratorsQueryGraphql
  );
  useMountingLoader(loadOrganizationAdministratorsQuery, { organizationId });

  const cancel = () => {
    window.opener?.postMessage({ action: 'cancel' }, '*');
  };

  if (!isAllowed) {
    return organizationAdministratorsQueryRef ? (
      <UnenrollOCTIMissingCapability
        queryRef={organizationAdministratorsQueryRef}
        cancel={cancel}
      />
    ) : (
      <Loader />
    );
  }

  return <>{platformId}</>;
};
