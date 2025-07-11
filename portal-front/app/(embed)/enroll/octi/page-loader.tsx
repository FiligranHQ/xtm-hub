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

  const { platform_id, platform_title, platform_url } = useDecodedQuery();

  const areParametersValid = platform_id && platform_title && platform_url;
  if (!areParametersValid) {
    return redirect('/');
  }

  const platform = {
    id: platform_id,
    title: platform_title,
    url: platform_url,
  };

  return queryRef ? (
    <EnrollOCTI
      queryRef={queryRef}
      platform={platform}
    />
  ) : (
    <Loader />
  );
};
