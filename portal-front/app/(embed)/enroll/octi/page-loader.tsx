'use client';

import { EnrollOCTI } from '@/components/enroll/octi';
import Loader from '@/components/loader';
import useDecodedQuery from '@/hooks/useDecodedQuery';
import useMountingLoader from '@/hooks/useMountingLoader';
import OrganizationListUserOrganizationsQuery, {
  organizationListUserOrganizationsQuery,
} from '@generated/organizationListUserOrganizationsQuery.graphql';
import { redirect } from 'next/navigation';
import React from 'react';
import { useQueryLoader } from 'react-relay';

export const PageLoader: React.FC = () => {
  const [queryRef, loadQuery] =
    useQueryLoader<organizationListUserOrganizationsQuery>(
      OrganizationListUserOrganizationsQuery
    );
  useMountingLoader(loadQuery, {});

  const {
    platform_id: platformId,
    platform_title: platformTitle,
    platform_url: platformUrl,
  } = useDecodedQuery();

  const areParametersValid = platformId && platformTitle && platformUrl;
  if (!areParametersValid) {
    return redirect('/');
  }

  return queryRef ? (
    <EnrollOCTI
      queryRef={queryRef}
      platformUrl={platformUrl}
      platformTitle={platformTitle}
      platformId={platformId}
    />
  ) : (
    <Loader />
  );
};
