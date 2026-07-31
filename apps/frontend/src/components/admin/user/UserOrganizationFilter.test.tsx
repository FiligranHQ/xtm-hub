import testRender from '@/utils/test/test-render';
import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { UserOrganizationFilter } from './UserOrganizationFilter';

const refetchMock = vi.fn();

vi.mock('@/components/organization/Organization.service', () => ({
  getOrganizations: () => ({
    organizationsData: {
      organizations: {
        edges: [
          {
            node: {
              id: 'org-acme',
              name: 'Acme Corporation',
              personal_space: false,
            },
          },
          {
            node: {
              id: 'org-globex',
              name: 'Globex Industries',
              personal_space: false,
            },
          },
          {
            node: {
              id: 'org-perso',
              name: 'Personal Space Org',
              personal_space: true,
            },
          },
        ],
      },
    },
    refetch: refetchMock,
  }),
}));

describe('UserOrganizationFilter', () => {
  it('renders the placeholder and lists non-personal organizations plus "All organizations"', async () => {
    const { user } = testRender(<UserOrganizationFilter onChange={vi.fn()} />);

    expect(screen.getByText('UserActions.Organization')).toBeInTheDocument();

    await user.click(screen.getByText('UserActions.Organization'));

    expect(
      screen.getByText('UserActions.AllOrganizations')
    ).toBeInTheDocument();
    expect(screen.getByText('Acme Corporation')).toBeInTheDocument();
    expect(screen.getByText('Globex Industries')).toBeInTheDocument();
    expect(screen.queryByText('Personal Space Org')).not.toBeInTheDocument();
  });

  it('calls onChange with the organization id when one is selected', async () => {
    const onChange = vi.fn();
    const { user } = testRender(<UserOrganizationFilter onChange={onChange} />);

    await user.click(screen.getByText('UserActions.Organization'));
    await user.click(screen.getByText('Acme Corporation'));

    expect(onChange).toHaveBeenCalledWith('org-acme');
  });

  it('calls onChange with undefined when "All organizations" is selected', async () => {
    const onChange = vi.fn();
    const { user } = testRender(<UserOrganizationFilter onChange={onChange} />);

    await user.click(screen.getByText('UserActions.Organization'));
    await user.click(screen.getByText('UserActions.AllOrganizations'));

    expect(onChange).toHaveBeenCalledWith(undefined);
  });
});
