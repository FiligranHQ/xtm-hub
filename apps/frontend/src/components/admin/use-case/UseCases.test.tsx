import UseCases from '@/components/admin/use-case/UseCases';
import { mockGraphqlQuery } from '@/utils/test/msw/graphql-api';
import { mswServer } from '@/utils/test/msw/server';
import testRender from '@/utils/test/test-render';
import { UseCasesListQuery } from '@graphql/generated';
import {
  mockUseCase,
  mockUseCaseConnection,
  mockUseCaseEdge,
} from '@graphql/mocks';
import { screen } from '@testing-library/react';

const renderComponent = () => testRender(<UseCases />);

describe('UseCases', () => {
  it('should render use cases from GraphQL query', async () => {
    const mockedUseCasesResponse: UseCasesListQuery = {
      useCases: mockUseCaseConnection({
        totalCount: 2,
        edges: [
          mockUseCaseEdge({
            node: mockUseCase({
              id: 'use-case-1',
              name: 'threat hunting',
              color: '#11aa22',
            }),
          }),
          mockUseCaseEdge({
            node: mockUseCase({
              id: 'use-case-2',
              name: 'incident response',
              color: '#3344ff',
            }),
          }),
        ],
      }),
    };

    mswServer.use(
      mockGraphqlQuery({
        queryName: 'UseCasesList',
        data: mockedUseCasesResponse,
      })
    );

    renderComponent();

    expect(
      await screen.findByRole('row', { name: 'Threat Hunting #11aa22' })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('row', { name: 'Incident Response #3344ff' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Add use case' })
    ).toBeInTheDocument();
  });

  it('should show an error message when GraphQL request fails', async () => {
    mswServer.use(
      mockGraphqlQuery({
        queryName: 'UseCasesList',
        errors: [{ message: 'UNKNOWN_ERROR' }],
      })
    );

    renderComponent();

    expect(await screen.findByText('Error')).toBeInTheDocument();
  });
});
