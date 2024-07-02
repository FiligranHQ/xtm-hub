'use client';
import * as React from 'react';
import GuardCapacityComponent from '@/components/admin-guard';
import OrganizationPage from '@/components/organization/organization-page';
import { RESTRICTION } from '@/utils/constant';

interface PageProps {}

// Component
const Page: React.FunctionComponent<PageProps> = () => {
  return (
    <GuardCapacityComponent
      capacityRestriction={[RESTRICTION.CAPABILITY_BYPASS]}>
      <OrganizationPage />
    </GuardCapacityComponent>
  );
};

// Component export
export default Page;
