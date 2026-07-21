import { ServiceListFilterKey } from '@/components/service/components/header/ServiceListHeader';
import testRender from '@/utils/test/test-render';
import { IntegrationSubType, IntegrationType } from '@graphql/generated';
import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { IntegrationTypeFilter } from './IntegrationTypeFilter';

const propsMock = vi.fn();
const removeFilterMock = vi.fn();
const setIntegrationTypesMock = vi.fn();
const removeIntegrationTypesMock = vi.fn();

vi.mock(
  '@/components/ui/shareable-resource/logical-multi-select/LogicalMultiSelectFormField',
  () => ({
    LogicalMultiSelectFormField: ({
      options,
      onValueChange,
      onRemove,
      placeholder,
      optionLabel,
    }: {
      options: Array<{
        label: string;
        value: string;
        children?: Array<{ label: string; value: string }>;
      }>;
      onValueChange: (value: Record<string, string[]>) => void;
      onRemove?: () => void;
      placeholder: string;
      optionLabel: string;
    }) => {
      propsMock({ options, onValueChange, onRemove, placeholder, optionLabel });
      return (
        <div>
          <button
            onClick={() => onValueChange({ [IntegrationType.Connector]: [] })}>
            change
          </button>
          <button onClick={onRemove}>remove</button>
        </div>
      );
    },
  })
);

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
    integrationTypes: { [IntegrationType.Connector]: [] },
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
  it('builds options with available first and subtype children + callback wiring', async () => {
    const { user } = testRender(<IntegrationTypeFilter />);
    const props = propsMock.mock.calls[0]?.[0] as {
      options: Array<{
        label: string;
        value: string;
        children?: Array<{ label: string; value: string }>;
      }>;
      placeholder: string;
      optionLabel: string;
    };

    expect(props.options[0]).toEqual({
      label: `Service.OpenctiIntegrations.Type.${IntegrationType.Connector}`,
      value: IntegrationType.Connector,
      children: [
        { label: 'External import', value: IntegrationSubType.ExternalImport },
      ],
    });
    expect(props.placeholder).toBe(
      'Service.OpenctiIntegrations.Filter.Type.Placeholder'
    );
    expect(props.optionLabel).toBe(
      'Service.OpenctiIntegrations.Filter.Type.Label'
    );

    await user.click(screen.getByText('change'));
    expect(setIntegrationTypesMock).toHaveBeenCalledWith({
      [IntegrationType.Connector]: [],
    });

    await user.click(screen.getByText('remove'));
    expect(removeIntegrationTypesMock).toHaveBeenCalledTimes(1);
    expect(removeFilterMock).toHaveBeenCalledWith(
      ServiceListFilterKey.IntegrationType
    );
  });
});
