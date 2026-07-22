import { ServiceListFilterKey } from '@/components/service/components/header/ServiceListHeader';
import testRender from '@/utils/test/test-render';
import { screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { IntegrationDeployableFilter } from './IntegrationDeployableFilter';

const removeFilterMock = vi.fn();
const setDeployableMock = vi.fn();
const removeDeployableMock = vi.fn();

vi.mock('@/hooks/use-service-list-local-storage', () => ({
  ServiceListLocalStorageKey: {
    OpenCTIIntegrationFeeds: 'feeds',
  },
  useServiceListLocalStorage: () => ({
    deployable: {},
    setDeployable: setDeployableMock,
    removeDeployable: removeDeployableMock,
  }),
}));

vi.mock('@/hooks/use-service-list-filters', () => ({
  useServiceListFilters: () => ({
    removeFilter: removeFilterMock,
  }),
}));

describe('IntegrationDeployableFilter', () => {
  it('renders placeholder and options after opening the popover', async () => {
    const { user } = testRender(<IntegrationDeployableFilter />);

    const placeholder = screen.getByText(
      'Service.OpenctiIntegrations.Filter.ManagerSupported.Placeholder'
    );
    expect(placeholder).toBeInTheDocument();

    await user.click(placeholder);
    const listbox = screen.getByRole('listbox');
    expect(
      within(listbox).getByText(
        'Service.OpenctiIntegrations.Filter.ManagerSupported.AutomaticDeploy'
      )
    ).toBeInTheDocument();
    expect(
      within(listbox).getByText(
        'Service.OpenctiIntegrations.Filter.ManagerSupported.ManualDeploy'
      )
    ).toBeInTheDocument();
  });

  it('calls setDeployable when an option is selected', async () => {
    const { user } = testRender(<IntegrationDeployableFilter />);

    await user.click(
      screen.getByText(
        'Service.OpenctiIntegrations.Filter.ManagerSupported.Placeholder'
      )
    );
    await user.click(
      within(screen.getByRole('listbox')).getByText(
        'Service.OpenctiIntegrations.Filter.ManagerSupported.AutomaticDeploy'
      )
    );

    expect(setDeployableMock).toHaveBeenCalledWith({ true: [] });
  });

  it('calls remove callbacks when the remove button is clicked', async () => {
    const { user } = testRender(<IntegrationDeployableFilter />);

    await user.click(screen.getByRole('button', { name: 'Remove filter' }));

    expect(removeDeployableMock).toHaveBeenCalledTimes(1);
    expect(removeFilterMock).toHaveBeenCalledWith(
      ServiceListFilterKey.ManagerSupported
    );
  });
});
