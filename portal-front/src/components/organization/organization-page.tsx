'use client';

import * as React from 'react';
import { useState } from 'react';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import OrganizationList from '@/components/organization/organization-list';
import { OrganizationCreateSheet } from '@/components/organization/organization-create-sheet';
import { getOrganizations } from '@/components/organization/organization.service';

export interface Organization {
  id: string;
  name: string;
}

const OrganizationPage: React.FunctionComponent = () => {
  const breadcrumbValue = [
    {
      href: '/',
      label: 'Home',
    },
    {
      label: 'Organizations',
    },
  ];

  const organizationData = getOrganizations();

  const initialOrganizations =
    organizationData.map((edge) => ({
      id: edge.node.id,
      name: edge.node.name,
    })) ?? [];
  const [organizations, setOrganizations] =
    useState<Organization[]>(initialOrganizations);

  const setAddedOrganization = (newOrganization: Organization) => {
    setOrganizations((previousOrganizations) => [
      newOrganization,
      ...previousOrganizations,
    ]);
  };
  return (
    <>
      <BreadcrumbNav value={breadcrumbValue} />

      <OrganizationList organizations={organizations} />
      <OrganizationCreateSheet setAddedOrganization={setAddedOrganization} />
    </>
  );
};
export default OrganizationPage;
