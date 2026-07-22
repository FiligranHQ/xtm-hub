import { ServiceListFilterKey } from '@/components/service/components/header/ServiceListHeader';
import testRender from '@/utils/test/test-render';
import { screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { IntegrationVerifiedFilter } from './IntegrationVerifiedFilter';

const removeFilterMock = vi.fn();
const setVerifiedMock = vi.fn();
const removeVerifiedMock = vi.fn();

vi.mock('@/hooks/use-service-list-local-storage', () => ({
  ServiceListLocalStorageKey: {
    OpenCTIIntegrationFeeds: 'feeds',
  },
  useServiceListLocalStorage: () => ({
    verified: {},
    setVerified: setVerifiedMock,
    removeVerified: removeVerifiedMock,
  }),
}));

vi.mock('@/hooks/use-service-list-filters', () => ({
  useServiceListFilters: () => ({
    removeFilter: removeFilterMock,
  }),
}));

describe('IntegrationVerifiedFilter', () => {
  it('renders placeholder and options after opening the popover', async () => {
    const { user } = testRender(<IntegrationVerifiedFilter />);

    const placeholder = screen.getByText(
      'Service.OpenctiIntegrations.Filter.Verified.Placeholder'
    );
    expect(placeholder).toBeInTheDocument();

    await user.click(placeholder);
    const listbox = screen.getByRole('listbox');
    expect(
      within(listbox).getByText(
        'Service.OpenctiIntegrations.Filter.Verified.Verified'
      )
    ).toBeInTheDocument();
    expect(
      within(listbox).getByText(
        'Service.OpenctiIntegrations.Filter.Verified.Unverified'
      )
    ).toBeInTheDocument();
  });

  it('calls setVerified when an option is selected', async () => {
    const { user } = testRender(<IntegrationVerifiedFilter />);

    await user.click(
      screen.getByText(
        'Service.OpenctiIntegrations.Filter.Verified.Placeholder'
      )
    );
    await user.click(
      within(screen.getByRole('listbox')).getByText(
        'Service.OpenctiIntegrations.Filter.Verified.Verified'
      )
    );

    expect(setVerifiedMock).toHaveBeenCalledWith({ true: [] });
  });

  it('calls remove callbacks when the remove button is clicked', async () => {
    const { user } = testRender(<IntegrationVerifiedFilter />);

    await user.click(screen.getByRole('button', { name: 'Remove filter' }));

    expect(removeVerifiedMock).toHaveBeenCalledTimes(1);
    expect(removeFilterMock).toHaveBeenCalledWith(
      ServiceListFilterKey.Verified
    );
  });
});
