import { ServiceListFilterKey } from '@/components/service/components/header/ServiceListHeader';
import { useRegisteredPlatforms } from '@/hooks/use-registered-platforms';
import { mockGraphqlQuery } from '@/utils/test/msw/graphql-api';
import { mswServer } from '@/utils/test/msw/server';
import testRender from '@/utils/test/test-render';
import {
  PlatformIdentifier,
  RegisteredProductVersionsListQuery,
} from '@graphql/generated';
import { screen, within } from '@testing-library/react';
import { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProductVersionFilter } from './ProductVersionFilter';

const VERSION_ZULU = '7.0';
const VERSION_ALPHA = '6.8';

const removeFilterMock = vi.fn();
const setProductVersionsMock = vi.fn();
const removeProductVersionsMock = vi.fn();

let storedProductVersions: Record<string, string[]> = {};

const mockRegisteredProductVersions = (versions: string[]) => {
  const data: RegisteredProductVersionsListQuery = {
    registeredProductVersions: versions.map((version) => ({
      __typename: 'RegisteredProductVersion',
      version,
    })),
  };
  mswServer.use(
    mockGraphqlQuery({ queryName: 'RegisteredProductVersionsList', data })
  );
};

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
    get productVersions() {
      return storedProductVersions;
    },
    setProductVersions: setProductVersionsMock,
    removeProductVersions: removeProductVersionsMock,
  }),
}));

vi.mock('@/hooks/use-service-list-filters', () => ({
  useServiceListFilters: () => ({
    removeFilter: removeFilterMock,
  }),
}));

vi.mock('@filigran/ui', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@filigran/ui')>()),
  SimpleTooltip: ({
    title,
    children,
  }: {
    title: ReactNode;
    children: ReactNode;
  }) => (
    <>
      <span data-testid="tooltip-title">{title}</span>
      {children}
    </>
  ),
}));

describe('ProductVersionFilter', () => {
  beforeEach(() => {
    storedProductVersions = {};
    mockRegisteredProductVersions([VERSION_ZULU, VERSION_ALPHA]);
    vi.mocked(useRegisteredPlatforms).mockReturnValue({ platforms: [] });
  });

  it('renders placeholder when no version is selected', () => {
    testRender(
      <ProductVersionFilter platformIdentifier={PlatformIdentifier.Opencti} />
    );

    expect(
      screen.getByText(
        'Service.OpenctiIntegrations.Filter.ProductVersion.Placeholder'
      )
    ).toBeInTheDocument();
  });

  it('renders versions in the order returned by the backend', async () => {
    const { user } = testRender(
      <ProductVersionFilter platformIdentifier={PlatformIdentifier.Opencti} />
    );

    await user.click(
      screen.getByText(
        'Service.OpenctiIntegrations.Filter.ProductVersion.Placeholder'
      )
    );

    const listbox = screen.getByRole('listbox');
    await within(listbox).findByText(VERSION_ZULU);
    const itemOptions = within(listbox)
      .getAllByRole('option')
      .filter(
        (el) =>
          el.getAttribute('data-value') === VERSION_ZULU ||
          el.getAttribute('data-value') === VERSION_ALPHA
      );
    expect(itemOptions[0]).toHaveTextContent(VERSION_ZULU);
    expect(itemOptions[1]).toHaveTextContent(VERSION_ALPHA);
  });

  it('calls setProductVersions with a single value when an option is selected', async () => {
    const { user } = testRender(
      <ProductVersionFilter platformIdentifier={PlatformIdentifier.Opencti} />
    );

    await user.click(
      screen.getByText(
        'Service.OpenctiIntegrations.Filter.ProductVersion.Placeholder'
      )
    );
    await user.click(
      await within(screen.getByRole('listbox')).findByText(VERSION_ALPHA)
    );

    expect(setProductVersionsMock).toHaveBeenCalledWith({
      [VERSION_ALPHA]: [],
    });
  });

  it('clears the selection when the already-selected option is clicked again', async () => {
    storedProductVersions = { [VERSION_ALPHA]: [] };

    const { user } = testRender(
      <ProductVersionFilter platformIdentifier={PlatformIdentifier.Opencti} />
    );

    await user.click(screen.getByText(VERSION_ALPHA));
    await user.click(
      await within(screen.getByRole('listbox')).findByText(VERSION_ALPHA)
    );

    expect(setProductVersionsMock).toHaveBeenCalledWith({});
  });

  it('shows a tooltip only on versions matching a registered instance', async () => {
    vi.mocked(useRegisteredPlatforms).mockReturnValue({
      platforms: [{ title: 'Alpha instance', version: VERSION_ALPHA }],
    });

    const { user } = testRender(
      <ProductVersionFilter platformIdentifier={PlatformIdentifier.Opencti} />
    );

    await user.click(
      screen.getByText(
        'Service.OpenctiIntegrations.Filter.ProductVersion.Placeholder'
      )
    );

    await within(screen.getByRole('listbox')).findByText(VERSION_ALPHA);
    expect(screen.getAllByTestId('tooltip-title')).toHaveLength(1);
    expect(screen.getByTestId('tooltip-title')).toHaveTextContent(
      'Service.OpenctiIntegrations.Filter.ProductVersion.RegisteredInstanceTooltip'
    );
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

  it('skips the registered-instance lookup on public pages', () => {
    testRender(
      <ProductVersionFilter
        platformIdentifier={PlatformIdentifier.Opencti}
        publicPath
      />
    );

    expect(useRegisteredPlatforms).toHaveBeenCalledWith(
      PlatformIdentifier.Opencti,
      { onlyActive: true, skip: true }
    );
  });
});
