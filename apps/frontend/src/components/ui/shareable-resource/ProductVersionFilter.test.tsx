import { ServiceListFilterKey } from '@/components/service/components/header/ServiceListHeader';
import testRender from '@/utils/test/test-render';
import { screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ProductVersionFilter } from './ProductVersionFilter';

const removeFilterMock = vi.fn();
const setProductVersionsMock = vi.fn();
const removeProductVersionsMock = vi.fn();

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
    productVersions: {},
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
  it('renders placeholder and sorted options after opening the popover', async () => {
    const { user } = testRender(
      <ProductVersionFilter platformIdentifier={'x' as never} />
    );

    expect(
      screen.getByText(
        'Service.OpenctiIntegrations.Filter.ProductVersion.Placeholder'
      )
    ).toBeInTheDocument();

    // Open the popover
    await user.click(
      screen.getByText(
        'Service.OpenctiIntegrations.Filter.ProductVersion.Placeholder'
      )
    );

    // Options should appear in sorted (alphabetical) order
    const listbox = screen.getByRole('listbox');
    const itemOptions = within(listbox)
      .getAllByRole('option')
      .filter((el) => el.getAttribute('data-value')?.startsWith('parent:'));
    expect(itemOptions[0]).toHaveTextContent('Alpha');
    expect(itemOptions[1]).toHaveTextContent('Zulu');
  });

  it('calls setProductVersions when an option is selected', async () => {
    const { user } = testRender(
      <ProductVersionFilter platformIdentifier={'x' as never} />
    );

    await user.click(
      screen.getByText(
        'Service.OpenctiIntegrations.Filter.ProductVersion.Placeholder'
      )
    );
    await user.click(within(screen.getByRole('listbox')).getByText('Alpha'));

    expect(setProductVersionsMock).toHaveBeenCalledWith({ '6.8': [] });
  });

  it('calls remove callbacks when the remove button is clicked', async () => {
    const { user } = testRender(
      <ProductVersionFilter platformIdentifier={'x' as never} />
    );

    await user.click(screen.getByRole('button', { name: 'Remove filter' }));

    expect(removeProductVersionsMock).toHaveBeenCalledTimes(1);
    expect(removeFilterMock).toHaveBeenCalledWith(
      ServiceListFilterKey.ProductVersion
    );
  });
});
