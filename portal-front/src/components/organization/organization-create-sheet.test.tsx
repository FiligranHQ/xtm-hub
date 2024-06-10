import React from 'react';
import { OrganizationCreateSheet } from '@/components/organization/organization-create-sheet';
import testRender from '@/utils/test/test-render';
import { screen, fireEvent, waitFor } from '@testing-library/react';

describe('OrganizationCreateSheet component', () => {
  it('render', async () => {
    const element = testRender(
      <OrganizationCreateSheet setAddedOrganization={() => {}} />
    );

    expect(!!element).toBe(true);
  });

  it('should enable create button on dirty form only', async () => {
    testRender(<OrganizationCreateSheet setAddedOrganization={() => {}} />);
    const openButton = screen.getByLabelText('Create Organization');
    fireEvent.click(openButton);

    const createButton = screen.getByText('Create') as HTMLButtonElement;

    // Initially, the button should be disabled
    expect(createButton).toBeDisabled();

    // Change the input to make the form dirty
    const input = screen.getByPlaceholderText('Name');
    fireEvent.change(input, { target: { value: 'New Organization' } });

    // The button should now be enabled
    await waitFor(() => {
      expect(createButton).not.toBeDisabled();
    });
    // Clear the input to make the form dirty again
    fireEvent.change(input, { target: { value: '' } });

    // The button should be disabled again
    await waitFor(() => {
      expect(createButton).toBeDisabled();
    });
  });
});
