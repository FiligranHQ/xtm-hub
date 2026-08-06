import { ServiceListFilterKey } from '@/components/service/components/header/ServiceListHeader';
import testRender from '@/utils/test/test-render';
import { LicenseType } from '@graphql/generated';
import { screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { IntegrationLicenseTypeFilter } from './IntegrationLicenseTypeFilter';

const removeFilterMock = vi.fn();
const setLicenseTypesMock = vi.fn();
const removeLicenseTypesMock = vi.fn();

vi.mock('@/hooks/use-service-list-local-storage', () => ({
  ServiceListLocalStorageKey: {
    OpenCTIIntegrationFeeds: 'feeds',
  },
  useServiceListLocalStorage: () => ({
    licenseTypes: {},
    setLicenseTypes: setLicenseTypesMock,
    removeLicenseTypes: removeLicenseTypesMock,
  }),
}));

vi.mock('@/hooks/use-service-list-filters', () => ({
  useServiceListFilters: () => ({
    removeFilter: removeFilterMock,
  }),
}));

describe('IntegrationLicenseTypeFilter', () => {
  it('renders placeholder and options after opening the popover', async () => {
    const { user } = testRender(<IntegrationLicenseTypeFilter />);

    const placeholder = screen.getByText(
      'Service.OpenctiIntegrations.Filter.LicenseType.Placeholder'
    );
    expect(placeholder).toBeInTheDocument();

    await user.click(placeholder);
    const listbox = screen.getByRole('listbox');
    expect(
      within(listbox).getByText(
        'Service.OpenctiIntegrations.Filter.LicenseType.Free'
      )
    ).toBeInTheDocument();
    expect(
      within(listbox).getByText(
        'Service.OpenctiIntegrations.Filter.LicenseType.Commercial'
      )
    ).toBeInTheDocument();
  });

  it('calls setLicenseTypes when an option is selected', async () => {
    const { user } = testRender(<IntegrationLicenseTypeFilter />);

    await user.click(
      screen.getByText(
        'Service.OpenctiIntegrations.Filter.LicenseType.Placeholder'
      )
    );
    await user.click(
      within(screen.getByRole('listbox')).getByText(
        'Service.OpenctiIntegrations.Filter.LicenseType.Free'
      )
    );

    expect(setLicenseTypesMock).toHaveBeenCalledWith({
      [LicenseType.Free]: [],
    });
  });

  it('calls remove callbacks when the remove button is clicked', async () => {
    const { user } = testRender(<IntegrationLicenseTypeFilter />);

    await user.click(screen.getByRole('button', { name: 'Remove filter' }));

    expect(removeLicenseTypesMock).toHaveBeenCalledTimes(1);
    expect(removeFilterMock).toHaveBeenCalledWith(
      ServiceListFilterKey.LicenseType
    );
  });
});
