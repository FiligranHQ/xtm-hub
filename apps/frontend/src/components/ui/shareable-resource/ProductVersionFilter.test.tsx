import { ServiceListFilterKey } from '@/components/service/components/header/ServiceListHeader';
import testRender from '@/utils/test/test-render';
import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ProductVersionFilter } from './ProductVersionFilter';

const logicalMultiSelectPropsMock = vi.fn();
const removeFilterMock = vi.fn();
const setProductVersionsMock = vi.fn();
const removeProductVersionsMock = vi.fn();

vi.mock(
  '@/components/ui/shareable-resource/logical-multi-select/LogicalMultiSelectFormField',
  () => ({
    LogicalMultiSelectFormField: ({
      onRemove,
      onValueChange,
      options,
      initialValue,
      placeholder,
      optionLabel,
      noResultString,
    }: {
      onRemove?: () => void;
      onValueChange: (value: Record<string, string[]>) => void;
      options: { label: string; value: string }[];
      initialValue?: Record<string, string[]>;
      placeholder: string;
      optionLabel: string;
      noResultString: string;
    }) => {
      logicalMultiSelectPropsMock({
        onRemove,
        onValueChange,
        options,
        initialValue,
        placeholder,
        optionLabel,
        noResultString,
      });
      return (
        <div>
          <button onClick={onRemove}>remove-filter</button>
          <button onClick={() => onValueChange({ opencti: ['6.8'] })}>
            change-filter
          </button>
        </div>
      );
    },
  })
);

vi.mock('@/hooks/use-registered-platforms', () => ({
  useRegisteredPlatforms: () => ({
    platforms: [
      { title: 'Zulu', version: '7.0' },
      { title: 'Alpha', version: '6.8' },
    ],
  }),
}));

vi.mock(
  '@/components/service/components/ServiceListLocalStorageKeyContext',
  () => ({
    useServiceListLocalStorageKeyContext: () => ({
      localStorageKey: 'k',
    }),
  })
);

vi.mock('@/hooks/use-service-list-local-storage', () => ({
  useServiceListLocalStorage: () => ({
    productVersions: { opencti: ['6.7'] },
    setProductVersions: setProductVersionsMock,
    removeProductVersions: removeProductVersionsMock,
  }),
}));

vi.mock('@/hooks/use-service-list-filters', () => ({
  useServiceListFilters: () => ({
    removeFilter: removeFilterMock,
  }),
}));

describe('ProductVersionFilter', () => {
  it('passes sorted options and wiring callbacks', async () => {
    const { user } = testRender(
      <ProductVersionFilter platformIdentifier={'x' as never} />
    );

    const props = logicalMultiSelectPropsMock.mock.calls[0]?.[0];
    expect(props.options).toEqual([
      { label: 'Alpha', value: '6.8' },
      { label: 'Zulu', value: '7.0' },
    ]);
    expect(props.initialValue).toEqual({ opencti: ['6.7'] });
    expect(props.placeholder).toBe(
      'Service.OpenctiIntegrations.Filter.ProductVersion.Placeholder'
    );
    expect(props.noResultString).toBe('Utils.NotFound');
    expect(props.optionLabel).toBe(
      'Service.OpenctiIntegrations.Filter.ProductVersion.Label'
    );

    await user.click(screen.getByText('change-filter'));
    expect(setProductVersionsMock).toHaveBeenCalledWith({ opencti: ['6.8'] });

    await user.click(screen.getByText('remove-filter'));
    expect(removeProductVersionsMock).toHaveBeenCalledTimes(1);
    expect(removeFilterMock).toHaveBeenCalledWith(
      ServiceListFilterKey.ProductVersion
    );
  });
});
