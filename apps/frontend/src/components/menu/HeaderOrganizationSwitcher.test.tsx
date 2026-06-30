import HeaderOrganizationSwitcher from '@/components/menu/HeaderOrganizationSwitcher';
import { APP_PATH } from '@/utils/path/constant';
import testRender from '@/utils/test/test-render';
import { screen } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const testState = vi.hoisted(() => ({
  commitMutation: vi.fn(),
}));

vi.mock('react-relay', async (importOriginal) => ({
  ...(await importOriginal()),
  useMutation: () => [testState.commitMutation, false],
}));

describe('HeaderOrganizationSwitcher', () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
    });
  });

  it('renders workspace label and selected organization on combobox trigger', () => {
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
    expect(
      screen.getByRole('combobox', {
        name: 'OrganizationSwitcher.SelectOrganization',
      })
    ).toHaveTextContent('Filigran Team');
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
      screen.getByRole('combobox', {
        name: 'OrganizationSwitcher.SelectOrganization',
      })
    );
    await user.click(
      screen.getByRole('option', { name: 'OrganizationSwitcher.PersonalSpace' })
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

    await user.click(
      screen.getByRole('combobox', {
        name: 'OrganizationSwitcher.SelectOrganization',
      })
    );
    await user.click(screen.getByRole('option', { name: 'Filigran Team' }));

    expect(testState.commitMutation).not.toHaveBeenCalled();
  });

  it('invalidates store and redirects when mutation completes', async () => {
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
      screen.getByRole('combobox', {
        name: 'OrganizationSwitcher.SelectOrganization',
      })
    );
    await user.click(
      screen.getByRole('option', { name: 'OrganizationSwitcher.PersonalSpace' })
    );

    const mutationConfig = testState.commitMutation.mock.calls[0]?.[0] as {
      updater?: (store: { invalidateStore: () => void }) => void;
      onCompleted?: () => void;
    };

    const invalidateStore = vi.fn();
    mutationConfig.updater?.({ invalidateStore });
    mutationConfig.onCompleted?.();

    expect(invalidateStore).toHaveBeenCalledOnce();
    expect(mockPush).toHaveBeenCalledWith(`/${APP_PATH}`);
  });
});
