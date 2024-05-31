'use client';
import * as React from 'react';
import OrganizationList from '@/components/organization/organization-list';
import GuardCapacityComponent from '@/components/admin-guard';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';

interface PageProps {}

// Component
const Page: React.FunctionComponent<PageProps> = () => {
  const breadcrumbValue = [
    {
      href: '/',
      label: 'Home',
    },
    {
      label: 'Organizations',
    },
  ];
  return (
    <GuardCapacityComponent capacityRestriction={'ADMIN'}>
      <BreadcrumbNav value={breadcrumbValue} />
      <OrganizationList />{' '}
    </GuardCapacityComponent>
  );
};

// Component export
export default Page;
