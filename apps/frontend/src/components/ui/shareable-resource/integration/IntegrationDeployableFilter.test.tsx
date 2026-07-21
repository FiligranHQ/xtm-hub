import { ServiceListFilterKey } from '@/components/service/components/header/ServiceListHeader';
import testRender from '@/utils/test/test-render';
import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { IntegrationDeployableFilter } from './IntegrationDeployableFilter';

const propsMock = vi.fn();
const removeFilterMock = vi.fn();
const setDeployableMock = vi.fn();
const removeDeployableMock = vi.fn();

vi.mock(
  '@/components/ui/shareable-resource/logical-multi-select/LogicalMultiSelectFormField',
  () => ({
    LogicalMultiSelectFormField: ({
      options,
      onValueChange,
      onRemove,
    }: {
      options: { label: string; value: string }[];
      onValueChange: (value: Record<string, string[]>) => void;
      onRemove?: () => void;
    }) => {
      propsMock({ options, onValueChange, onRemove });
      return (
        <div>
          <button onClick={() => onValueChange({ deployable: ['true'] })}>
            change
          </button>
          <button onClick={onRemove}>remove</button>
        </div>
      );
    },
  })
);

vi.mock('@/hooks/use-service-list-local-storage', () => ({
  ServiceListLocalStorageKey: {
    OpenCTIIntegrationFeeds: 'feeds',
  },
  useServiceListLocalStorage: () => ({
    deployable: { deployable: ['false'] },
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
  it('wires option values and remove behavior', async () => {
    const { user } = testRender(<IntegrationDeployableFilter />);

    const props = propsMock.mock.calls[0]?.[0];
    expect(props.options).toEqual([
      {
        label:
          'Service.OpenctiIntegrations.Filter.ManagerSupported.AutomaticDeploy',
        value: 'true',
      },
      {
        label:
          'Service.OpenctiIntegrations.Filter.ManagerSupported.ManualDeploy',
        value: 'false',
      },
    ]);

    await user.click(screen.getByText('change'));
    expect(setDeployableMock).toHaveBeenCalledWith({ deployable: ['true'] });

    await user.click(screen.getByText('remove'));
    expect(removeDeployableMock).toHaveBeenCalledTimes(1);
    expect(removeFilterMock).toHaveBeenCalledWith(
      ServiceListFilterKey.ManagerSupported
    );
  });
});
