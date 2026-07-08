import { RegistrationContext } from '@/components/registration/Context';
import { PlatformMetadataMapping } from '@/components/registration/PlatformIdentifierMapping';
import { RegisterOrganizationForm } from '@/components/registration/register/OrganizationForm';
import testRender from '@/utils/test/test-render';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import { organizationListUserOrganizationsQuery$data } from '@generated/organizationListUserOrganizationsQuery.graphql';
import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const twoOrgs: organizationListUserOrganizationsQuery$data = {
  userOrganizations: [
    { id: 'org-1', name: 'Org One', personal_space: false },
    { id: 'org-2', name: 'Org Two', personal_space: true },
  ],
};

const mixedOrgs: organizationListUserOrganizationsQuery$data = {
  userOrganizations: [
    { id: 'org-personal', name: 'Personal', personal_space: true },
    { id: 'org-pro-1', name: 'Pro One', personal_space: false },
    { id: 'org-pro-2', name: 'Pro Two', personal_space: false },
  ],
};

const renderForm = (
  orgs: organizationListUserOrganizationsQuery$data = twoOrgs,
  cancel: () => void = vi.fn(),
  confirm: (id: string) => void = vi.fn()
) =>
  testRender(
    <RegistrationContext.Provider
      value={{
        displayedIdentifier:
          PlatformMetadataMapping[PlatformIdentifierEnum.OPENCTI].name,
      }}>
      <RegisterOrganizationForm
        userOrganizationsQueryData={orgs}
        cancel={cancel}
        confirm={confirm}
      />
    </RegistrationContext.Provider>
  );

describe('RegisterOrganizationForm', () => {
  it('renders the whole component properly', () => {
    renderForm();
    expect(screen.getByText('Org One', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('Org Two', { exact: false })).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(2);
    expect(
      screen.getByText('Register.OrganizationForm.Title')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Register.OrganizationForm.Description')
    ).toBeInTheDocument();
  });

  it('calls cancel when the cancel button is clicked', async () => {
    const cancel = vi.fn();
    const { user } = renderForm(twoOrgs, cancel);
    await user.click(screen.getByRole('button', { name: 'Utils.Cancel' }));
    expect(cancel).toHaveBeenCalledOnce();
  });

  it('calls confirm with the first organization id when the form is submitted', async () => {
    const confirm = vi.fn();
    const { user } = renderForm(twoOrgs, vi.fn(), confirm);

    await user.click(screen.getByRole('button', { name: 'Register.Confirm' }));

    await waitFor(() => {
      expect(confirm).toHaveBeenCalledWith('org-1');
    });
  });

  it('renders no radio buttons when there are no organizations', () => {
    renderForm({ userOrganizations: [] });
    expect(screen.queryAllByRole('radio')).toHaveLength(0);
  });

  it('renders professional organizations before the personal one', () => {
    renderForm(mixedOrgs);
    const radios = screen.getAllByRole('radio') as HTMLInputElement[];
    expect(radios.map((radio) => radio.value)).toEqual([
      'Pro One',
      'Pro Two',
      'Personal',
    ]);
  });

  it('defaults to the first professional organization when submitted', async () => {
    const confirm = vi.fn();
    const { user } = renderForm(mixedOrgs, vi.fn(), confirm);

    await user.click(screen.getByRole('button', { name: 'Register.Confirm' }));

    await waitFor(() => {
      expect(confirm).toHaveBeenCalledWith('org-pro-1');
    });
  });
});
