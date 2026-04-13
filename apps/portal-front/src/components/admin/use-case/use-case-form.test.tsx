import UseCaseForm from '@/components/admin/use-case/use-case-form';
import testRender from '@/utils/test/test-render';
import { useCase_fragment$data } from '@generated/useCase_fragment.graphql';
import { screen } from '@testing-library/react';

describe('UseCaseForm', () => {
  describe('form validation', () => {
    const mockHandleSubmit = vi.fn();
    const mockOnClose = vi.fn();

    beforeEach(() => {
      vi.clearAllMocks();
    });

    const renderAndSubmit = async ({
      name,
      color,
    }: {
      name: string;
      color: string;
    }) => {
      const { user } = testRender(
        <UseCaseForm
          handleSubmit={mockHandleSubmit}
          onClose={mockOnClose}
        />
      );

      const [, colorInput] = screen.getAllByRole('textbox');

      await user.type(screen.getByLabelText(/Name/i), name);
      await user.type(colorInput, color);
      await user.click(screen.getByRole('button', { name: /Validate/i }));
    };

    it.each`
      color
      ${'#12'}
      ${'#12345g'}
      ${'blue'}
      ${'123456'}
    `(
      'should reject invalid color "$color"',
      async ({ color }: { color: string }) => {
        await renderAndSubmit({
          name: 'Threat hunting',
          color,
        });

        expect(mockHandleSubmit).not.toHaveBeenCalled();
      }
    );

    it('should reject name shorter than 2 characters', async () => {
      await renderAndSubmit({
        name: 'A',
        color: '#123456',
      });

      expect(mockHandleSubmit).not.toHaveBeenCalled();
    });
  });

  describe('actions', () => {
    const mockHandleSubmit = vi.fn();
    const mockHandleDelete = vi.fn();
    const mockOnClose = vi.fn();

    const useCase: useCase_fragment$data = {
      id: 'use-case-id',
      name: 'Threat hunting',
      color: '#123456',
      ' $fragmentType': 'useCase_fragment',
    };

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should call onClose when clicking cancel', async () => {
      const { user } = testRender(
        <UseCaseForm
          handleSubmit={mockHandleSubmit}
          onClose={mockOnClose}
        />
      );

      await user.click(screen.getByRole('button', { name: /Cancel/i }));

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call handleDelete on delete confirmation', async () => {
      const { user } = testRender(
        <UseCaseForm
          useCase={useCase}
          handleSubmit={mockHandleSubmit}
          handleDelete={mockHandleDelete}
          onClose={mockOnClose}
        />
      );

      await user.click(screen.getByRole('button', { name: /^Delete$/i }));
      await user.click(screen.getByRole('button', { name: /^Delete$/i }));

      expect(mockHandleDelete).toHaveBeenCalledTimes(1);
    });
  });
});
