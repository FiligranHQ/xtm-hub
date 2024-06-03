'use client';

import * as React from 'react';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import OrganizationList from '@/components/organization/organization-list';
import { OrganizationCreateSheet } from '@/components/organization/organization-create-sheet';

interface OrganizationsProps {}

const OrganizationPage: React.FunctionComponent<OrganizationsProps> = ({}) => {
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
    <>
      <BreadcrumbNav value={breadcrumbValue} />
      <OrganizationCreateSheet />
      <OrganizationList />
    </>
  );
};
export default OrganizationPage;
