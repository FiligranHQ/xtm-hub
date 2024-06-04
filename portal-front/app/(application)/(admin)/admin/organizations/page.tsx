'use client';
import * as React from 'react';
import GuardCapacityComponent from '@/components/admin-guard';
import OrganizationPage from '@/components/organization/organization-page';

interface PageProps {}

// Component
const Page: React.FunctionComponent<PageProps> = () => {
  return (
    <GuardCapacityComponent capacityRestriction={'ADMIN'}>
      <OrganizationPage />
    </GuardCapacityComponent>
  );
};

// Component export
export default Page;
