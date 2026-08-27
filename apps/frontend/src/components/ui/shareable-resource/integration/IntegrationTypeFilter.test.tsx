import { ServiceListFilterKey } from '@/components/service/components/header/ServiceListHeader';
import testRender from '@/utils/test/test-render';
import { IntegrationType } from '@graphql/generated';
import { screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { IntegrationTypeFilter } from './IntegrationTypeFilter';

const removeFilterMock = vi.fn();
const setIntegrationTypesMock = vi.fn();
const removeIntegrationTypesMock = vi.fn();

vi.mock('@/hooks/use-service-list-local-storage', () => ({
  ServiceListLocalStorageKey: {
    OpenCTIIntegrationFeeds: 'feeds',
  },
  useServiceListLocalStorage: () => ({
    integrationTypes: {},
    setIntegrationTypes: setIntegrationTypesMock,
    removeIntegrationTypes: removeIntegrationTypesMock,
  }),
}));

vi.mock('@/hooks/use-service-list-filters', () => ({
  useServiceListFilters: () => ({
    removeFilter: removeFilterMock,
  }),
}));

describe('IntegrationTypeFilter', () => {
  it('calls setIntegrationTypes when Connector is selected', async () => {
    const { user } = testRender(<IntegrationTypeFilter />);

    await user.click(
      screen.getByText('Service.OpenctiIntegrations.Filter.Type.Placeholder')
    );
    await user.click(
      within(screen.getByRole('listbox')).getByText(
        `Service.OpenctiIntegrations.Type.${IntegrationType.Connector}`
      )
    );

    expect(setIntegrationTypesMock).toHaveBeenCalledWith({
      [IntegrationType.Connector]: [],
    });
  });

  it('calls remove callbacks when the remove button is clicked', async () => {
    const { user } = testRender(<IntegrationTypeFilter />);

    await user.click(screen.getByRole('button', { name: 'Remove filter' }));

    expect(removeIntegrationTypesMock).toHaveBeenCalledTimes(1);
    expect(removeFilterMock).toHaveBeenCalledWith(
      ServiceListFilterKey.IntegrationType
    );
  });
});
