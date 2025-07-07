'use client';

import { EnrollOCTI } from '@/components/enroll/octi';
import Loader from '@/components/loader';
import useMountingLoader from '@/hooks/useMountingLoader';
import OrganizationListUserOrganizationsQuery, {
  organizationListUserOrganizationsQuery,
} from '@generated/organizationListUserOrganizationsQuery.graphql';
import React from 'react';
import { useQueryLoader } from 'react-relay';

export const PageLoader: React.FC = () => {
  const [queryRef, loadQuery] =
    useQueryLoader<organizationListUserOrganizationsQuery>(
      OrganizationListUserOrganizationsQuery
    );
  useMountingLoader(loadQuery, {});

  return queryRef ? <EnrollOCTI queryRef={queryRef} /> : <Loader />;
};
