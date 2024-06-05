import React from 'react';
import { render } from '@testing-library/react';

import '@testing-library/jest-dom';
import OrganizationList from '@/components/organization/organization-list'; // Importer l'extension jest-dom pour les matchers supplémentaires

const mockOrganizations = [
  { id: '1', name: 'Organization 1' },
  { id: '2', name: 'Organization 2' },
];

describe('OrganizationList component', () => {
  it('render with given organizations data', async () => {
    const { getByText } = render(
      <OrganizationList organizations={mockOrganizations} />
    );

    expect(getByText('Organization 1')).toBeInTheDocument();
    expect(getByText('Organization 2')).toBeInTheDocument();
  });

  it('render an empty tab', async () => {
    const { queryByTestId } = render(<OrganizationList organizations={[]} />);

    expect(queryByTestId('data-table')).toBeNull();
  });
});
