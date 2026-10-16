import HuntPackServiceList from '@/components/service/opencti-hunt-packs/HuntPackServiceList';
import { portalGraphqlClient } from '@/lib/graphql-client';
import testRender from '@/utils/test/test-render';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
import {
  useHuntPackDocumentsQuery,
  useHuntPackLibraryVisibilityQuery,
} from '@graphql/generated';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@graphql/generated', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@graphql/generated')>()),
  useHuntPackDocumentsQuery: vi.fn(),
  useHuntPackLibraryVisibilityQuery: vi.fn(),
}));

vi.mock(
  '@/components/service/opencti-hunt-packs/hunt-pack-documents',
  async (importOriginal) => ({
    ...(await importOriginal<
      typeof import('@/components/service/opencti-hunt-packs/hunt-pack-documents')
    >()),
    useHuntPackDocumentContext: () => ({}),
  })
);

vi.mock('@/hooks/use-document-facet-counts', () => ({
  useDocumentFacetCounts: () => undefined,
}));

vi.mock('@/utils/shareable-resources/use-shareable-resource-mapping', () => ({
  useShareableResourceMapping: () => ({ filters: {} }),
}));

vi.mock('@/components/ui/pagination/PaginationControls', () => ({
  PaginationControls: ({ totalCount }: { totalCount: number }) => (
    <div data-testid="pagination">{totalCount}</div>
  ),
}));

vi.mock('@/components/service/components/ServiceList', () => ({
  default: ({
    active,
    draft,
    paginationControls,
    notice,
  }: {
    active: { id: string; name: string }[];
    draft: { id: string; name: string }[];
    paginationControls: React.ReactNode;
    notice: React.ReactNode;
  }) => (
    <div>
      {notice}
      <ul data-testid="active">
        {active.map(({ id, name }) => (
          <li key={id}>{name}</li>
        ))}
      </ul>
      <ul data-testid="draft">
        {draft.map(({ id, name }) => (
          <li key={id}>{name}</li>
        ))}
      </ul>
      {paginationControls}
    </div>
  ),
}));

const serviceInstance = {
  id: 'service-1',
} as unknown as serviceInstance_fragment$data;

const mockQuery = (result: Record<string, unknown>) =>
  vi
    .mocked(useHuntPackDocumentsQuery)
    .mockReturnValue(
      result as unknown as ReturnType<typeof useHuntPackDocumentsQuery>
    );

const mockVisibility = (hiddenUntilPublished: boolean) =>
  vi.mocked(useHuntPackLibraryVisibilityQuery).mockReturnValue({
    data: {
      serviceInstanceById: {
        id: 'service-1',
        hidden_until_published: hiddenUntilPublished,
      },
    },
  } as unknown as ReturnType<typeof useHuntPackLibraryVisibilityQuery>);

const listedDocuments = {
  data: {
    documents: {
      totalCount: 1,
      edges: [{ node: { id: 'pack-1', name: 'Draft pack', active: false } }],
    },
  },
  isPending: false,
  isError: false,
};

const renderList = () =>
  testRender(
    <HuntPackServiceList
      serviceInstance={serviceInstance}
      search="credential"
      onSearchChange={vi.fn()}
    />
  );

describe('HuntPackServiceList', () => {
  beforeEach(() => {
    mockVisibility(false);
  });

  it('tells the administrator that only administrators see the library while no pack is published', () => {
    mockQuery(listedDocuments);
    mockVisibility(true);

    renderList();

    expect(useHuntPackLibraryVisibilityQuery).toHaveBeenCalledWith(
      portalGraphqlClient,
      { serviceInstanceId: 'service-1' }
    );
    expect(
      screen.getByText('Service.OpenCTIHuntPack.HiddenUntilPublished.Title')
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Service.OpenCTIHuntPack.HiddenUntilPublished.Description'
      )
    ).toBeInTheDocument();
  });

  it('says nothing about the visibility once a pack is published', () => {
    mockQuery(listedDocuments);

    renderList();

    expect(
      screen.queryByText('Service.OpenCTIHuntPack.HiddenUntilPublished.Title')
    ).not.toBeInTheDocument();
  });

  it('lists the active and draft hunt packs read with React Query', () => {
    mockQuery({
      data: {
        documents: {
          totalCount: 2,
          edges: [
            { node: { id: 'pack-1', name: 'Active pack', active: true } },
            { node: { id: 'pack-2', name: 'Draft pack', active: false } },
          ],
        },
      },
      isPending: false,
      isError: false,
    });

    renderList();

    expect(useHuntPackDocumentsQuery).toHaveBeenCalledWith(
      portalGraphqlClient,
      expect.objectContaining({
        cursor: null,
        searchTerm: 'credential',
        serviceInstanceId: 'service-1',
      }),
      expect.objectContaining({ placeholderData: expect.any(Function) })
    );
    expect(screen.getByTestId('active')).toHaveTextContent('Active pack');
    expect(screen.getByTestId('draft')).toHaveTextContent('Draft pack');
    expect(screen.getByTestId('pagination')).toHaveTextContent('2');
  });

  it('shows card placeholders in the shape of the list while the first page loads', () => {
    mockQuery({ data: undefined, isPending: true, isError: false });

    renderList();

    const placeholders = screen.getByRole('list', { name: 'Utils.Loading' });
    expect(placeholders).toHaveAttribute('aria-busy', 'true');
    expect(within(placeholders).getAllByRole('listitem')).toHaveLength(6);
    expect(screen.queryByTestId('active')).not.toBeInTheDocument();
  });

  it('says the hunt packs could not be loaded, with a way to try again', async () => {
    const refetch = vi.fn();
    mockQuery({
      data: undefined,
      error: new Error('Network request failed'),
      isPending: false,
      isError: true,
      isFetching: false,
      refetch,
    });

    renderList();

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Error.SomethingWentWrong');
    expect(alert).toHaveTextContent(
      'Service.OpenCTIHuntPack.LoadError.Library'
    );
    expect(alert).not.toHaveTextContent('Error.AnErrorOccured');
    expect(screen.queryByTestId('active')).not.toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', { name: 'Error.TryAgain' })
    );
    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
