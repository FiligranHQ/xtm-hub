import AddSolutionCategory from '@/components/admin/solution-category/AddSolutionCategory';
import { mockGraphqlMutation } from '@/utils/test/msw/graphql-api';
import { mswServer } from '@/utils/test/msw/server';
import testRender from '@/utils/test/test-render';
import { SolutionCategoryAddMutation } from '@graphql/generated';
import { mockSolutionCategory } from '@graphql/mocks';
import { screen, waitFor } from '@testing-library/react';

const GQL_OPERATION_SOLUTION_CATEGORY_ADD = 'SolutionCategoryAdd';

describe('AddSolutionCategory', () => {
  it('should render add trigger and open sheet', async () => {
    const { user } = testRender(<AddSolutionCategory />);

    await user.click(
      screen.getByRole('button', { name: 'SolutionCategoryActions.Add' })
    );

    expect(
      screen.getByRole('heading', { name: 'SolutionCategoryActions.Add' })
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText('SolutionCategoryForm.Name')
    ).toBeInTheDocument();
  });

  it('should submit SolutionCategoryAdd mutation and close sheet on success', async () => {
    const addSolutionCategoryResponse: SolutionCategoryAddMutation = {
      addSolutionCategory: mockSolutionCategory({
        id: 'new-solution-category-id',
        name: 'threat hunting',
      }),
    };

    mswServer.use(
      mockGraphqlMutation({
        queryName: GQL_OPERATION_SOLUTION_CATEGORY_ADD,
        data: addSolutionCategoryResponse,
      })
    );

    const { user } = testRender(<AddSolutionCategory />);

    await user.click(
      screen.getByRole('button', { name: 'SolutionCategoryActions.Add' })
    );
    await user.type(
      screen.getByLabelText(/SolutionCategoryForm.Name/i),
      'Threat Hunting'
    );
    await user.click(screen.getByRole('button', { name: /Utils.Validate/i }));

    await waitFor(() => {
      expect(
        screen.queryByLabelText(/SolutionCategoryForm.Name/i)
      ).not.toBeInTheDocument();
    });
  });

  it('should keep sheet open when SolutionCategoryAdd returns a GraphQL error', async () => {
    mswServer.use(
      mockGraphqlMutation({
        queryName: GQL_OPERATION_SOLUTION_CATEGORY_ADD,
        errors: [{ message: 'UNKNOWN_ERROR' }],
      })
    );

    const { user } = testRender(<AddSolutionCategory />);

    await user.click(
      screen.getByRole('button', { name: 'SolutionCategoryActions.Add' })
    );
    await user.type(
      screen.getByLabelText(/SolutionCategoryForm.Name/i),
      'Threat Hunting'
    );
    await user.click(screen.getByRole('button', { name: /Utils.Validate/i }));

    expect(
      await screen.findByLabelText(/SolutionCategoryForm.Name/i)
    ).toBeInTheDocument();
  });
});
