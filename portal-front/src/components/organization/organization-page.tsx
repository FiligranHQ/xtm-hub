'use client';

import * as React from 'react';
import { useState } from 'react';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import OrganizationList from '@/components/organization/organization-list';
import { OrganizationCreateSheet } from '@/components/organization/organization-create-sheet';
import { getOrganizations } from '@/components/organization/organization.service';
import { useMutation } from 'react-relay';
import { organizationDeletionMutation } from '../../../__generated__/organizationDeletionMutation.graphql';
import { organizationDeletion } from '@/components/organization/organization.graphql';
import { DialogInformative } from '@/components/ui/dialog';

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
  const [deleteOrganizationMutation] =
    useMutation<organizationDeletionMutation>(organizationDeletion);

  const [isErrorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const organizationToDelete = (orgaToDelete: string) => {
    deleteOrganizationMutation({
      variables: { id: orgaToDelete },
      onCompleted: (response: any) => {
        setOrganizations(
          organizations.filter(
            (organization) => organization.id !== response.deleteOrganization.id
          )
        );
      },
      onError: (error) => {
        const message = error.message.includes(
          'violates foreign key constraint "user_organization_id_foreign" on table "User"'
        )
          ? 'The organization could not be deleted because at least one user is affiliated with it. Delete the user(s) first. '
          : error.message
            ? error.message
            : 'An unexpected error occurred';
        setErrorMessage(message);
        setErrorDialogOpen(true);
      },
    });
  };

  const handleClose = () => {
    setErrorDialogOpen(false);
  };

  return (
    <>
      <BreadcrumbNav value={breadcrumbValue} />

      <OrganizationList
        organizationToDelete={organizationToDelete}
        organizations={organizations}
      />
      <OrganizationCreateSheet setAddedOrganization={setAddedOrganization} />
      <DialogInformative
        isOpen={isErrorDialogOpen}
        onClose={handleClose}
        title="Error"
        description={'An error occured while deleting this organization.'}>
        <p>{errorMessage}</p>
      </DialogInformative>
    </>
  );
};
export default OrganizationPage;
