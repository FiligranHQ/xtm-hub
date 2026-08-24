import { ManageTrialHeader } from '@/components/service/bundle/manage-trial/ManageTrialHeader';
import { mockGraphqlQuery } from '@/utils/test/msw/graphql-api';
import { mswServer } from '@/utils/test/msw/server';
import testRender from '@/utils/test/test-render';
import { BundleUserServiceGroupsQuery, UsersQuery } from '@graphql/generated';
import { mockUserConnection } from '@graphql/mocks';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

const bundleUserServiceGroupsResponse: BundleUserServiceGroupsQuery = {
  __typename: 'Query',
  bundleUserServiceGroups: [],
};

const usersResponse: UsersQuery = {
  __typename: 'Query',
  users: mockUserConnection({ edges: [] }),
};

describe('ManageTrialHeader', () => {
  it('opens the add trial user dialog when the button is clicked', async () => {
    mswServer.use(
      mockGraphqlQuery({
        queryName: 'BundleUserServiceGroups',
        data: bundleUserServiceGroupsResponse,
      }),
      mockGraphqlQuery({ queryName: 'Users', data: usersResponse })
    );

    const { user } = testRender(
      <ManageTrialHeader serviceInstanceId="bundle-1" />
    );

    expect(
      screen.queryByText('Service.Bundle.ManageTrial.AddUserDialog.Title')
    ).not.toBeInTheDocument();

    await user.click(
      screen.getByRole('button', {
        name: 'Service.Bundle.ManageTrial.AddTrialUser',
      })
    );

    expect(
      await screen.findByText('Service.Bundle.ManageTrial.AddUserDialog.Title')
    ).toBeInTheDocument();
  });
});
