import { ManageTrialTable } from '@/components/service/bundle/manage-trial/ManageTrialTable';
import testRender from '@/utils/test/test-render';
import {
  BundleUserServiceGroupsQuery,
  PlatformIdentifier,
  ServiceGroupName,
} from '@graphql/generated';
import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const graphqlMocks = vi.hoisted(() => ({
  useBundleUserServiceGroupsQuery: Object.assign(vi.fn(), {
    getKey: vi.fn((_variables: unknown) => ['BundleUserServiceGroups']),
    getRootKey: vi.fn(() => ['BundleUserServiceGroups']),
  }),
}));

vi.mock('@graphql/generated', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@graphql/generated')>();
  return {
    ...actual,
    useBundleUserServiceGroupsQuery:
      graphqlMocks.useBundleUserServiceGroupsQuery,
  };
});

vi.mock('@filigran/ui', () => ({
  DataTable: ({
    data,
    isLoading,
  }: {
    data: Array<{ id: string; email: string }>;
    isLoading?: boolean;
  }) => (
    <div>
      {isLoading ? <div>loading</div> : null}
      {data.map((row) => (
        <div key={row.id}>{row.email}</div>
      ))}
    </div>
  ),
}));

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

describe('ManageTrialTable', () => {
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
});
