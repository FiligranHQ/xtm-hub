'use client';

import { EnrollErrorCapability } from '@/components/enroll/error/capability';
import Loader from '@/components/loader';
import useDecodedQuery from '@/hooks/useDecodedQuery';
import useMountingLoader from '@/hooks/useMountingLoader';
import UserListOrganizationAdministratorsQueryGraphql, {
  userListOrganizationAdministratorsQuery,
} from '@generated/userListOrganizationAdministratorsQuery.graphql';
import { redirect } from 'next/navigation';
import React from 'react';
import { useQueryLoader } from 'react-relay';

export const PageLoader: React.FC = () => {
  const params = useDecodedQuery();
  if (!params.organization_id) {
    return redirect('/');
  }

  const [queryRef, loadQuery] =
    useQueryLoader<userListOrganizationAdministratorsQuery>(
      UserListOrganizationAdministratorsQueryGraphql
    );

  useMountingLoader(loadQuery, { organizationId: params.organization_id });

  return queryRef ? <EnrollErrorCapability queryRef={queryRef} /> : <Loader />;
};
