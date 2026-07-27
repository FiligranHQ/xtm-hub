import SolutionCategories from '@/components/admin/solution-category/SolutionCategories';
import { mockGraphqlQuery } from '@/utils/test/msw/graphql-api';
import { mswServer } from '@/utils/test/msw/server';
import testRender from '@/utils/test/test-render';
import {
  FiligranProduct,
  SolutionCategoriesListQuery,
} from '@graphql/generated';
import {
  mockSolutionCategory,
  mockSolutionCategoryConnection,
  mockSolutionCategoryEdge,
} from '@graphql/mocks';
import { screen } from '@testing-library/react';

describe('SolutionCategories', () => {
  it('should render solution categories from GraphQL query', async () => {
    const mockedSolutionCategoriesResponse: SolutionCategoriesListQuery = {
      solutionCategories: mockSolutionCategoryConnection({
        totalCount: 2,
        edges: [
          mockSolutionCategoryEdge({
            node: mockSolutionCategory({
              id: 'solution-category-1',
              name: 'threat hunting',
              product: [FiligranProduct.Opencti],
            }),
          }),
          mockSolutionCategoryEdge({
            node: mockSolutionCategory({
              id: 'solution-category-2',
              name: 'incident response',
              product: [FiligranProduct.Openaev],
            }),
          }),
        ],
      }),
    };

    mswServer.use(
      mockGraphqlQuery({
        queryName: 'SolutionCategoriesList',
        data: mockedSolutionCategoriesResponse,
      })
    );

    testRender(<SolutionCategories />);

    expect(await screen.findByText('Threat Hunting')).toBeInTheDocument();
    expect(await screen.findByText('Incident Response')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'SolutionCategoryActions.Add' })
    ).toBeInTheDocument();
  });

  it('should open edit sheet when clicking a row', async () => {
    const mockedSolutionCategoriesResponse: SolutionCategoriesListQuery = {
      solutionCategories: mockSolutionCategoryConnection({
        totalCount: 1,
        edges: [
          mockSolutionCategoryEdge({
            node: mockSolutionCategory({
              id: 'solution-category-1',
              name: 'threat hunting',
              product: [FiligranProduct.Opencti],
            }),
          }),
        ],
      }),
    };

    mswServer.use(
      mockGraphqlQuery({
        queryName: 'SolutionCategoriesList',
        data: mockedSolutionCategoriesResponse,
      })
    );

    const { user } = testRender(<SolutionCategories />);

    await user.click(await screen.findByText('Threat Hunting'));

    expect(
      await screen.findByLabelText('SolutionCategoryForm.Name')
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue('threat hunting')).toBeInTheDocument();
  });
});
