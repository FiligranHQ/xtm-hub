import { ServiceListFilterKey } from '@/components/service/components/header/ServiceListHeader';
import testRender from '@/utils/test/test-render';
import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { IntegrationVerifiedFilter } from './IntegrationVerifiedFilter';

const propsMock = vi.fn();
const removeFilterMock = vi.fn();
const setVerifiedMock = vi.fn();
const removeVerifiedMock = vi.fn();

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
          <button onClick={() => onValueChange({ verified: ['true'] })}>
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
    verified: { verified: ['false'] },
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
  it('wires option values and remove behavior', async () => {
    const { user } = testRender(<IntegrationVerifiedFilter />);

    const props = propsMock.mock.calls[0]?.[0];
    expect(props.options).toEqual([
      {
        label: 'Service.OpenctiIntegrations.Filter.Verified.Verified',
        value: 'true',
      },
      {
        label: 'Service.OpenctiIntegrations.Filter.Verified.Unverified',
        value: 'false',
      },
    ]);

    await user.click(screen.getByText('change'));
    expect(setVerifiedMock).toHaveBeenCalledWith({ verified: ['true'] });

    await user.click(screen.getByText('remove'));
    expect(removeVerifiedMock).toHaveBeenCalledTimes(1);
    expect(removeFilterMock).toHaveBeenCalledWith(
      ServiceListFilterKey.Verified
    );
  });
});
