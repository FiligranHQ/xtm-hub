import HeaderOrganizationSwitcher from '@/components/menu/HeaderOrganizationSwitcher';
import testRender from '@/utils/test/test-render';
import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

interface OrganizationOption {
  value: string;
  label: string;
}

const testState = vi.hoisted(() => ({
  commitMutation: vi.fn(),
}));

vi.mock('react-relay', async (importOriginal) => ({
  ...(await importOriginal()),
  useMutation: () => [testState.commitMutation, false],
}));

vi.mock('@filigran/ui/clients', async (importOriginal) => ({
  ...(await importOriginal()),
  Combobox: ({
    dataTab,
    value,
    onValueChange,
  }: {
    dataTab: OrganizationOption[];
    value?: OrganizationOption;
    onValueChange: (value?: OrganizationOption) => void;
  }) => (
    <div>
      <span data-testid="selected-organization-label">{value?.label}</span>
      {dataTab.map((organization) => (
        <button
          key={organization.value}
          onClick={() => onValueChange(organization)}>
          {organization.label}
        </button>
      ))}
    </div>
  ),
}));

describe('HeaderOrganizationSwitcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders workspace label and selected organization label', () => {
    testRender(<HeaderOrganizationSwitcher />, {
      me: {
        email: 'john.doe@filigran.io',
        selected_organization_id: 'organization-2',
        organizations: [
          {
            id: 'organization-1',
            name: 'john.doe@filigran.io',
            personal_space: true,
          },
          {
            id: 'organization-2',
            name: 'Filigran Team',
            personal_space: false,
          },
        ],
      },
    });

    expect(
      screen.getByText('OrganizationSwitcher.Workspace')
    ).toBeInTheDocument();
    expect(screen.getByTestId('selected-organization-label')).toHaveTextContent(
      'Filigran Team'
    );
  });

  it('triggers mutation when selecting another organization', async () => {
    const { user } = testRender(<HeaderOrganizationSwitcher />, {
      me: {
        email: 'john.doe@filigran.io',
        selected_organization_id: 'organization-2',
        organizations: [
          {
            id: 'organization-1',
            name: 'john.doe@filigran.io',
            personal_space: true,
          },
          {
            id: 'organization-2',
            name: 'Filigran Team',
            personal_space: false,
          },
        ],
      },
    });

    await user.click(
      screen.getByRole('button', { name: 'OrganizationSwitcher.PersonalSpace' })
    );

    expect(testState.commitMutation).toHaveBeenCalledOnce();
    expect(testState.commitMutation).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: {
          organization_id: 'organization-1',
        },
      })
    );
  });

  it('does not trigger mutation when selecting current organization', async () => {
    const { user } = testRender(<HeaderOrganizationSwitcher />, {
      me: {
        email: 'john.doe@filigran.io',
        selected_organization_id: 'organization-2',
        organizations: [
          {
            id: 'organization-1',
            name: 'john.doe@filigran.io',
            personal_space: true,
          },
          {
            id: 'organization-2',
            name: 'Filigran Team',
            personal_space: false,
          },
        ],
      },
    });

    await user.click(screen.getByRole('button', { name: 'Filigran Team' }));

    expect(testState.commitMutation).not.toHaveBeenCalled();
  });
});
