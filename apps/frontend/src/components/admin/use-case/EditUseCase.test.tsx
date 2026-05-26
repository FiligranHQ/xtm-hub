import EditUseCase from '@/components/admin/use-case/EditUseCase';
import { UseCaseFormModel } from '@/components/admin/use-case/UseCaseForm';
import { mockGraphqlMutation } from '@/utils/test/msw/graphql-api';
import { mswServer } from '@/utils/test/msw/server';
import testRender from '@/utils/test/test-render';
import { UseCaseDeleteMutation, UseCaseEditMutation } from '@graphql/generated';
import { mockUseCase } from '@graphql/mocks';
import { screen, waitFor } from '@testing-library/react';

const GQL_OPERATION_USE_CASE_EDIT = 'UseCaseEdit';
const GQL_OPERATION_USE_CASE_DELETE = 'UseCaseDelete';

const useCase: UseCaseFormModel = {
  id: 'use-case-id',
  name: 'Threat hunting',
  color: '#123456',
};

describe('EditUseCase', () => {
  it('should render opened sheet with prefilled values', () => {
    const onClose = vi.fn();

    testRender(
      <EditUseCase
        open={true}
        onClose={onClose}
        useCase={useCase}
      />
    );

    // Then
    expect(screen.getByLabelText('Name')).toBeTruthy();
    expect(screen.getByDisplayValue('Threat hunting')).toBeTruthy();
  });

  it('should submit UseCaseEdit mutation, close sheet and call onClose', async () => {
    const onClose = vi.fn();
    const editUseCaseResponse: UseCaseEditMutation = {
      editUseCase: mockUseCase({
        id: useCase.id,
        name: 'Updated UseCase',
        color: '#123456',
      }),
    };

    mswServer.use(
      mockGraphqlMutation({
        queryName: GQL_OPERATION_USE_CASE_EDIT,
        data: editUseCaseResponse,
      })
    );

    const { user } = testRender(
      <EditUseCase
        open={true}
        onClose={onClose}
        useCase={useCase}
      />
    );

    const nameInput = screen.getByLabelText(/Name/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated UseCase');
    await user.click(screen.getByRole('button', { name: /Validate/i }));

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  it('should submit UseCaseDelete mutation after confirmation and call onClose', async () => {
    const onClose = vi.fn();
    const deleteUseCaseResponse: UseCaseDeleteMutation = {
      deleteUseCase: mockUseCase({
        id: useCase.id,
      }),
    };

    mswServer.use(
      mockGraphqlMutation({
        queryName: GQL_OPERATION_USE_CASE_DELETE,
        data: deleteUseCaseResponse,
      })
    );

    const { user } = testRender(
      <EditUseCase
        open={true}
        onClose={onClose}
        useCase={useCase}
      />
    );

    await user.click(screen.getByRole('button', { name: /^Delete$/i }));
    await user.click(screen.getByRole('button', { name: /^Delete$/i }));

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
