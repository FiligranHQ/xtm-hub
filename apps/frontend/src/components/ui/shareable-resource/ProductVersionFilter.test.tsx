import { ServiceListFilterKey } from '@/components/service/components/header/ServiceListHeader';
import { useRegisteredPlatforms } from '@/hooks/use-registered-platforms';
import testRender from '@/utils/test/test-render';
import { PlatformIdentifier } from '@graphql/generated';
import { screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProductVersionFilter } from './ProductVersionFilter';

const PLATFORM_TITLE_ALPHA = 'Alpha';
const PLATFORM_VERSION_ALPHA = '6.8';
const PLATFORM_TITLE_ZULU = 'Zulu';
const PLATFORM_VERSION_ZULU = '7.0';

const removeFilterMock = vi.fn();
const setProductVersionsMock = vi.fn();
const removeProductVersionsMock = vi.fn();

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
  beforeEach(() => {
    vi.mocked(useRegisteredPlatforms).mockReturnValue({
      platforms: [
        { title: PLATFORM_TITLE_ZULU, version: PLATFORM_VERSION_ZULU },
        { title: PLATFORM_TITLE_ALPHA, version: PLATFORM_VERSION_ALPHA },
      ],
    });
  });

  it('renders placeholder and sorted options after opening the popover', async () => {
    const { user } = testRender(
      <ProductVersionFilter platformIdentifier={PlatformIdentifier.Opencti} />
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
    expect(itemOptions[0]).toHaveTextContent(PLATFORM_TITLE_ALPHA);
    expect(itemOptions[1]).toHaveTextContent(PLATFORM_TITLE_ZULU);
  });

  it('calls setProductVersions when an option is selected', async () => {
    const { user } = testRender(
      <ProductVersionFilter platformIdentifier={PlatformIdentifier.Opencti} />
    );

    await user.click(
      screen.getByText(
        'Service.OpenctiIntegrations.Filter.ProductVersion.Placeholder'
      )
    );
    await user.click(
      within(screen.getByRole('listbox')).getByText(PLATFORM_TITLE_ALPHA)
    );

    expect(setProductVersionsMock).toHaveBeenCalledWith({
      [PLATFORM_VERSION_ALPHA]: [],
    });
  });

  it('calls remove callbacks when the remove button is clicked', async () => {
    const { user } = testRender(
      <ProductVersionFilter platformIdentifier={PlatformIdentifier.Opencti} />
    );

    await user.click(screen.getByRole('button', { name: 'Remove filter' }));

    expect(removeProductVersionsMock).toHaveBeenCalledTimes(1);
    expect(removeFilterMock).toHaveBeenCalledWith(
      ServiceListFilterKey.ProductVersion
    );
  });
});
