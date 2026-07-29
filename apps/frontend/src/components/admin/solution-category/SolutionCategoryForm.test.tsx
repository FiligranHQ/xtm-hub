import SolutionCategoryForm from '@/components/admin/solution-category/SolutionCategoryForm';
import testRender from '@/utils/test/test-render';
import { FiligranProduct } from '@graphql/generated';
import { screen, waitFor } from '@testing-library/react';

describe('SolutionCategoryForm', () => {
  describe('form validation', () => {
    const mockHandleSubmit = vi.fn();
    const mockOnClose = vi.fn();

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should reject name shorter than 2 characters', async () => {
      const { user } = testRender(
        <SolutionCategoryForm
          handleSubmit={mockHandleSubmit}
          onClose={mockOnClose}
        />
      );

      await user.type(
        screen.getByLabelText(/SolutionCategory.Form.Name/i),
        'A'
      );
      await user.click(screen.getByRole('button', { name: /Utils.Validate/i }));

      expect(mockHandleSubmit).not.toHaveBeenCalled();
    });

    it('should submit form when values are valid', async () => {
      const { user } = testRender(
        <SolutionCategoryForm
          handleSubmit={mockHandleSubmit}
          onClose={mockOnClose}
        />
      );

      await user.type(
        screen.getByLabelText(/SolutionCategory.Form.Name/i),
        'Threat hunting'
      );
      await user.click(screen.getByRole('button', { name: /Utils.Validate/i }));

      await waitFor(() => {
        expect(mockHandleSubmit).toHaveBeenCalledTimes(1);
        expect(mockHandleSubmit.mock.calls[0]?.[0]).toEqual({
          name: 'Threat hunting',
          product: [],
        });
      });
    });
  });

  describe('actions', () => {
    const mockHandleSubmit = vi.fn();
    const mockHandleDelete = vi.fn();
    const mockOnClose = vi.fn();

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should call onClose when clicking cancel', async () => {
      const { user } = testRender(
        <SolutionCategoryForm
          handleSubmit={mockHandleSubmit}
          onClose={mockOnClose}
        />
      );

      await user.click(screen.getByRole('button', { name: 'Utils.Cancel' }));

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call handleDelete on delete confirmation', async () => {
      const { user } = testRender(
        <SolutionCategoryForm
          solutionCategory={{
            id: 'solution-category-id',
            name: 'Threat hunting',
            product: [FiligranProduct.Opencti],
          }}
          handleSubmit={mockHandleSubmit}
          handleDelete={mockHandleDelete}
          onClose={mockOnClose}
        />
      );

      await user.click(
        screen.getByRole('button', { name: 'MenuActions.Delete' })
      );
      await user.click(
        screen.getByRole('button', { name: 'MenuActions.Delete' })
      );

      expect(mockHandleDelete).toHaveBeenCalledTimes(1);
    });
  });
});
