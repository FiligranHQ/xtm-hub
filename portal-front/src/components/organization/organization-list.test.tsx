import React from 'react';
import { waitFor } from '@testing-library/react';

import '@testing-library/jest-dom';
import OrganizationList from '@/components/organization/organization-list';
import testRender from '@/utils/test/test-render';

const mockOrganizations = [
  { id: '1', name: 'Organization 1' },
  { id: '2', name: 'Organization 2' },
];

describe('OrganizationList component', () => {
  it('render with given organizations data', async () => {
    const { getByText } = testRender(
      <OrganizationList
        organizations={mockOrganizations}
        organizationToDelete={() => '1'}
      />
    );

    await waitFor(() => {
      expect(getByText('Organization 1')).toBeInTheDocument();
      expect(getByText('Organization 2')).toBeInTheDocument();
    });
  });

  it('render an empty tab', async () => {
    const { queryByTestId } = testRender(
      <OrganizationList
        organizations={[]}
        organizationToDelete={() => '1'}
      />
    );

    expect(queryByTestId('data-table')).toBeNull();
  });
});
