import UserList from '@/components/admin/user/UserList';
import { PortalContext } from '@/components/me/AppPortalContext';
import testRender from '@/utils/test/test-render';
import { screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  isAdminPath: true,
  canDeleteUser: true,
  totalCount: 0,
  edges: [] as Array<{ node: Record<string, unknown> }>,
  refetch: vi.fn(),
  setConnectionId: vi.fn(),
  capturedColumns: [] as Array<{ id?: string }>,
}));

vi.mock('react-relay', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-relay')>();
  return {
    ...actual,
    graphql: (
      strings: TemplateStringsArray,
      ..._values: ReadonlyArray<unknown>
    ) => strings.join(''),
    readInlineData: (_fragment: unknown, node: unknown) => node,
    useSubscription: vi.fn(),
  };
});

vi.mock('@/hooks/use-admin-path', () => ({
  default: () => mocks.isAdminPath,
}));

vi.mock('@/hooks/use-portal-capability', () => ({
  useAdminByPass: () => mocks.canDeleteUser,
}));

vi.mock('@/hooks/use-users-list', () => ({
  useUsersList: () => ({
    data: {
      users: {
        __id: 'users-connection-id',
        totalCount: mocks.totalCount,
        edges: mocks.edges,
      },
    },
    refetch: mocks.refetch,
  }),
}));

vi.mock('@/components/admin/user/user-list-localstorage', () => ({
  useUserListLocalstorage: () => ({
    pageSize: 10,
    setPageSize: vi.fn(),
    orderMode: 'asc',
    setOrderMode: vi.fn(),
    orderBy: 'first_name',
    setOrderBy: vi.fn(),
    columnOrder: [],
    setColumnOrder: vi.fn(),
    columnVisibility: {},
    setColumnVisibility: vi.fn(),
    organizationFilter: undefined,
    setOrganizationFilter: vi.fn(),
    resetAll: vi.fn(),
    removeOrder: vi.fn(),
  }),
}));

vi.mock('@/components/admin/user/UserListPage', () => ({
  getUserListContext: () => ({ setConnectionId: mocks.setConnectionId }),
}));

vi.mock('@/components/ui/handle-sorting.utils', () => ({
  handleSortingChange: vi.fn(),
  mapToSortingTableValue: () => [],
  transformSortingValueToParams: () => ({}),
}));

vi.mock('@/components/admin/user/UserOrganizationFilter', () => ({
  UserOrganizationFilter: () => <div>UserOrganizationFilter</div>,
}));

vi.mock('@filigran/ui', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@filigran/ui')>();
  return {
    ...actual,
    DataTableHeadBarOptions: () => <div>DataTableHeadBarOptions</div>,
    DataTable: ({
      columns,
      toolbar,
    }: {
      columns: Array<{ id?: string }>;
      toolbar?: ReactNode;
    }) => {
      mocks.capturedColumns = columns;
      return (
        <div>
          <div>DataTable</div>
          {toolbar}
        </div>
      );
    },
  };
});

const renderUserList = () =>
  testRender(
    <PortalContext.Provider
      value={{
        me: {
          id: 'me-user-id',
          selected_organization_id: 'organization-1',
          organizations: [],
          selected_org_capabilities: [],
          capabilities: [],
        } as never,
      }}>
      <UserList />
    </PortalContext.Provider>
  );

describe('UserList', () => {
  beforeEach(() => {
    mocks.isAdminPath = true;
    mocks.canDeleteUser = true;
    mocks.totalCount = 0;
    mocks.edges = [];
    mocks.refetch.mockReset();
    mocks.setConnectionId.mockReset();
    mocks.capturedColumns = [];
  });

  it('should render the empty state when there are no users', () => {
    renderUserList();

    expect(screen.getByText('UserListPage.NoUsers')).toBeInTheDocument();
  });

  it('should include the actions column for admin users with delete capability', () => {
    mocks.totalCount = 1;
    mocks.edges = [
      {
        node: {
          id: 'user-1',
          email: 'user-1@test.io',
          first_name: 'First',
          last_name: 'Last',
          disabled: false,
          last_login: null,
          country: null,
          organization_capabilities: [],
        },
      },
    ];

    renderUserList();

    expect(
      mocks.capturedColumns.some((column) => column.id === 'actions')
    ).toBe(true);
  });

  it('should not include the actions column when delete capability is missing', () => {
    mocks.totalCount = 1;
    mocks.canDeleteUser = false;
    mocks.edges = [
      {
        node: {
          id: 'user-1',
          email: 'user-1@test.io',
          first_name: 'First',
          last_name: 'Last',
          disabled: false,
          last_login: null,
          country: null,
          organization_capabilities: [],
        },
      },
    ];

    renderUserList();

    expect(
      mocks.capturedColumns.some((column) => column.id === 'actions')
    ).toBe(false);
  });

  it('should include capability column outside the admin path', () => {
    mocks.totalCount = 1;
    mocks.isAdminPath = false;
    mocks.edges = [
      {
        node: {
          id: 'user-1',
          email: 'user-1@test.io',
          first_name: 'First',
          last_name: 'Last',
          disabled: false,
          last_login: null,
          country: null,
          organization_capabilities: [
            {
              id: 'org-cap-1',
              organization: {
                id: 'organization-1',
                name: 'Organization',
                personal_space: false,
              },
              capabilities: ['ADMINISTRATE_ORGANIZATION'],
            },
          ],
        },
      },
    ];

    renderUserList();

    expect(
      mocks.capturedColumns.some((column) => column.id === 'capability')
    ).toBe(true);
    expect(
      mocks.capturedColumns.some((column) => column.id === 'actions')
    ).toBe(false);
  });
});
