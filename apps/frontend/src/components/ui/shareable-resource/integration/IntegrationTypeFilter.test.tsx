import { ServiceListFilterKey } from '@/components/service/components/header/ServiceListHeader';
import { useIsFeatureEnabled } from '@/hooks/use-is-feature-enabled';
import testRender from '@/utils/test/test-render';
import { IntegrationSubType, IntegrationType } from '@graphql/generated';
import { screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { IntegrationTypeFilter } from './IntegrationTypeFilter';

const removeFilterMock = vi.fn();
const setIntegrationTypesMock = vi.fn();
const removeIntegrationTypesMock = vi.fn();

vi.mock('@/components/service/integrations/Integration.utils', () => ({
  availableIntegrationTypes: [IntegrationType.Connector],
  SubTypesPerIntegrationType: new Map([
    [IntegrationType.Connector, [IntegrationSubType.ExternalImport]],
  ]),
  getIntegrationSubTypeMetadata: () => ({ label: 'External import' }),
}));

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
  it('renders placeholder and shows Connector option with its subtype after opening', async () => {
    vi.mocked(useIsFeatureEnabled).mockReturnValue(false);
    const { user } = testRender(<IntegrationTypeFilter />);

    const placeholder = screen.getByText(
      'Service.OpenctiIntegrations.Filter.Type.Placeholder'
    );
    expect(placeholder).toBeInTheDocument();

    await user.click(placeholder);
    const listbox = screen.getByRole('listbox');
    expect(
      within(listbox).getByText(
        `Service.OpenctiIntegrations.Type.${IntegrationType.Connector}`
      )
    ).toBeInTheDocument();
    expect(within(listbox).getByText('External import')).toBeInTheDocument();
  });

  it('hides subtype options when solution categories feature is enabled', async () => {
    vi.mocked(useIsFeatureEnabled).mockReturnValue(true);
    const { user } = testRender(<IntegrationTypeFilter />);

    await user.click(
      screen.getByText('Service.OpenctiIntegrations.Filter.Type.Placeholder')
    );
    const listbox = screen.getByRole('listbox');
    expect(
      within(listbox).getByText(
        `Service.OpenctiIntegrations.Type.${IntegrationType.Connector}`
      )
    ).toBeInTheDocument();
    expect(
      within(listbox).queryByText('External import')
    ).not.toBeInTheDocument();
  });

  it('hides subtype options when forced by prop', async () => {
    vi.mocked(useIsFeatureEnabled).mockReturnValue(false);
    const { user } = testRender(
      <IntegrationTypeFilter isSolutionCategoriesEnabled />
    );

    await user.click(
      screen.getByText('Service.OpenctiIntegrations.Filter.Type.Placeholder')
    );
    const listbox = screen.getByRole('listbox');
    expect(
      within(listbox).getByText(
        `Service.OpenctiIntegrations.Type.${IntegrationType.Connector}`
      )
    ).toBeInTheDocument();
    expect(
      within(listbox).queryByText('External import')
    ).not.toBeInTheDocument();
  });

  it('calls setIntegrationTypes when Connector is selected', async () => {
    vi.mocked(useIsFeatureEnabled).mockReturnValue(false);
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
    vi.mocked(useIsFeatureEnabled).mockReturnValue(false);
    const { user } = testRender(<IntegrationTypeFilter />);

    await user.click(screen.getByRole('button', { name: 'Remove filter' }));

    expect(removeIntegrationTypesMock).toHaveBeenCalledTimes(1);
    expect(removeFilterMock).toHaveBeenCalledWith(
      ServiceListFilterKey.IntegrationType
    );
  });
});
