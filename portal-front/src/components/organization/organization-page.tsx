'use client';

import * as React from 'react';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import OrganizationList from '@/components/organization/organization-list';
import { OrganizationCreateSheet } from '@/components/organization/organization-create-sheet';
import { useState } from 'react';
import { getOrganizations } from '@/components/organization/organization.service';

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

  const organizationData = getOrganizations();

  const initialOrganizations =
    organizationData.map((edge) => ({
      id: edge.node.id ?? '',
      name: edge.node.name ?? '',
    })) ?? [];
  const [organizations, setOrganizations] =
    useState<{ id: string; name: string }[]>(initialOrganizations);

  const setAddedOrganization = (newOrganization: {
    id: string;
    name: string;
  }) => {
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
