import { ManageTrialTable } from '@/components/service/bundle/manage-trial/ManageTrialTable';
import testRender from '@/utils/test/test-render';
import {
  BundleUserServiceGroupsQuery,
  PlatformIdentifier,
  RemoveUsersFromBundleGroupsMutation,
  RemoveUsersFromBundleGroupsMutationVariables,
  ServiceGroupName,
} from '@graphql/generated';
import { UseMutationOptions } from '@tanstack/react-query';
import { screen, waitFor, within } from '@testing-library/react';
import { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

interface MockActionsCellRow {
  id: string;
  email: string;
}

interface MockDataTableColumn {
  id: string;
  cell?: (context: { row: { original: MockActionsCellRow } }) => ReactNode;
}

type RemoveUsersFromBundleGroupsOptions = UseMutationOptions<
  RemoveUsersFromBundleGroupsMutation,
  unknown,
  RemoveUsersFromBundleGroupsMutationVariables,
  unknown
>;

const graphqlMocks = vi.hoisted(() => ({
  useBundleUserServiceGroupsQuery: Object.assign(vi.fn(), {
    getKey: vi.fn((_variables: unknown) => ['BundleUserServiceGroups']),
    getRootKey: vi.fn(() => ['BundleUserServiceGroups']),
  }),
  useRemoveUsersFromBundleGroupsMutation: vi.fn(),
}));

vi.mock('@graphql/generated', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@graphql/generated')>();
  return {
    ...actual,
    useBundleUserServiceGroupsQuery:
      graphqlMocks.useBundleUserServiceGroupsQuery,
    useRemoveUsersFromBundleGroupsMutation:
      graphqlMocks.useRemoveUsersFromBundleGroupsMutation,
  };
});

const toastMock = vi.hoisted(() => vi.fn());

vi.mock('@filigran/ui', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@filigran/ui')>();
  return {
    ...actual,
    toast: toastMock,
    DataTable: ({
      data,
      isLoading,
      columns,
    }: {
      data: MockActionsCellRow[];
      isLoading?: boolean;
      columns: MockDataTableColumn[];
    }) => {
      const actionsColumn = columns.find((column) => column.id === 'actions');
      return (
        <div>
          {isLoading ? <div>loading</div> : null}
          {data.map((row) => (
            <div key={row.id}>
              <span>{row.email}</span>
              {actionsColumn?.cell?.({ row: { original: row } })}
            </div>
          ))}
        </div>
      );
    },
  };
});

const baseQueryResponse: BundleUserServiceGroupsQuery = {
  __typename: 'Query',
  bundleUserServiceGroups: [
    {
      __typename: 'BundleUserServiceGroup',
      user: {
        __typename: 'User',
        id: 'user-1',
        email: 'user1@filigran.io',
      },
      groups: [
        {
          __typename: 'UserPlatformGroup',
          platformIdentifier: PlatformIdentifier.Opencti,
          name: ServiceGroupName.Admin,
        },
      ],
    },
  ],
};

const openDeleteDialog = async (
  user: { click: (el: Element) => unknown },
  dialogTitle = 'Service.Bundle.ManageTrial.Table.DeleteDialog.Title'
) => {
  await user.click(await screen.findByLabelText('Utils.Delete'));
  return screen.getByRole('alertdialog', { name: dialogTitle });
};

describe('ManageTrialTable', () => {
  beforeEach(() => {
    toastMock.mockReset();
    graphqlMocks.useRemoveUsersFromBundleGroupsMutation.mockReturnValue({
      mutate: vi.fn(),
    });
  });

  it('renders bundle users from query data', async () => {
    graphqlMocks.useBundleUserServiceGroupsQuery.mockReturnValue({
      data: baseQueryResponse,
      isError: false,
      isLoading: false,
    });

    testRender(<ManageTrialTable serviceInstanceId="bundle-1" />);

    expect(await screen.findByText('user1@filigran.io')).toBeInTheDocument();
  });

  it('shows error message when query fails', async () => {
    graphqlMocks.useBundleUserServiceGroupsQuery.mockReturnValue({
      data: undefined,
      isError: true,
      isLoading: false,
    });

    testRender(<ManageTrialTable serviceInstanceId="bundle-1" />);

    expect(await screen.findByText('Utils.Error')).toBeInTheDocument();
  });

  it('shows empty state when there are no bundle users', async () => {
    graphqlMocks.useBundleUserServiceGroupsQuery.mockReturnValue({
      data: { __typename: 'Query', bundleUserServiceGroups: [] },
      isError: false,
      isLoading: false,
    });

    testRender(<ManageTrialTable serviceInstanceId="bundle-1" />);

    expect(
      await screen.findByText('Service.Bundle.ManageTrial.Table.NoUsers')
    ).toBeInTheDocument();
  });

  it('passes serviceInstanceId as a query variable', () => {
    graphqlMocks.useBundleUserServiceGroupsQuery.mockReturnValue({
      data: baseQueryResponse,
      isError: false,
      isLoading: false,
    });

    testRender(<ManageTrialTable serviceInstanceId="bundle-1" />);

    const lastCall =
      graphqlMocks.useBundleUserServiceGroupsQuery.mock.calls.at(-1);
    expect(lastCall?.[1]).toMatchObject({ serviceInstanceId: 'bundle-1' });
  });

  it('asks for confirmation and calls the remove mutation with the row user id when confirmed', async () => {
    graphqlMocks.useBundleUserServiceGroupsQuery.mockReturnValue({
      data: baseQueryResponse,
      isError: false,
      isLoading: false,
    });
    const mutate = vi.fn();
    graphqlMocks.useRemoveUsersFromBundleGroupsMutation.mockReturnValue({
      mutate,
    });

    const { user } = testRender(
      <ManageTrialTable serviceInstanceId="bundle-1" />
    );

    const dialog = await openDeleteDialog(user);
    await user.click(
      within(dialog).getByRole('button', { name: 'Utils.Delete' })
    );

    expect(mutate).toHaveBeenCalledWith({
      serviceInstanceId: 'bundle-1',
      userIds: ['user-1'],
    });
  });

  it('shows a success toast when the removal succeeds', async () => {
    graphqlMocks.useBundleUserServiceGroupsQuery.mockReturnValue({
      data: baseQueryResponse,
      isError: false,
      isLoading: false,
    });
    graphqlMocks.useRemoveUsersFromBundleGroupsMutation.mockImplementation(
      (_client: unknown, options?: RemoveUsersFromBundleGroupsOptions) => ({
        mutate: (variables: RemoveUsersFromBundleGroupsMutationVariables) =>
          options?.onSuccess?.(
            { removeUsersFromBundleGroups: variables.userIds },
            variables,
            undefined
          ),
      })
    );

    const { user } = testRender(
      <ManageTrialTable serviceInstanceId="bundle-1" />
    );

    const dialog = await openDeleteDialog(user);
    await user.click(
      within(dialog).getByRole('button', { name: 'Utils.Delete' })
    );

    await waitFor(() =>
      expect(toastMock).toHaveBeenCalledWith({ title: 'Utils.Success' })
    );
  });

  it('shows a destructive toast when the removal fails', async () => {
    graphqlMocks.useBundleUserServiceGroupsQuery.mockReturnValue({
      data: baseQueryResponse,
      isError: false,
      isLoading: false,
    });
    graphqlMocks.useRemoveUsersFromBundleGroupsMutation.mockImplementation(
      (_client: unknown, options?: RemoveUsersFromBundleGroupsOptions) => ({
        mutate: (variables: RemoveUsersFromBundleGroupsMutationVariables) =>
          options?.onError?.(new Error('UnknownError'), variables, undefined),
      })
    );

    const { user } = testRender(
      <ManageTrialTable serviceInstanceId="bundle-1" />
    );

    const dialog = await openDeleteDialog(user);
    await user.click(
      within(dialog).getByRole('button', { name: 'Utils.Delete' })
    );

    await waitFor(() =>
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'destructive',
          title: 'Utils.Error',
        })
      )
    );
  });
});
