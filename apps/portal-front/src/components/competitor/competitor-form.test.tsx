import CompetitorForm from '@/components/competitor/competitor-form';
import testRender from '@/utils/test/test-render';
import { screen } from '@testing-library/react';

describe('CompetitorForm', () => {
  describe('domain field validation', () => {
    const mockHandleSubmit = vi.fn();
    const mockOnClose = vi.fn();

    beforeEach(() => {
      vi.clearAllMocks();
    });

    const renderAndSubmit = async (domainValue: string) => {
      const { user } = testRender(
        <CompetitorForm
          handleSubmit={mockHandleSubmit}
          onClose={mockOnClose}
        />
      );

      await user.type(screen.getByLabelText(/Name/i), 'Acme Corp');
      await user.type(screen.getByLabelText(/Domain/i), domainValue);
      await user.click(screen.getByRole('button', { name: /Add competitor/i }));
    };

    it.each([['example.com'], ['my-company.io'], ['sub.example.co.uk']])(
      'should accept valid domain "%s"',
      async (domain) => {
        await renderAndSubmit(domain);
        expect(mockHandleSubmit).toHaveBeenCalledWith(
          expect.objectContaining({ domain })
        );
      }
    );

    it.each([
      ['https://example.com'],
      ['http://example.com'],
      ['example.com/path'],
      ['example'],
    ])('should reject invalid domain "%s"', async (domain) => {
      await renderAndSubmit(domain);
      expect(mockHandleSubmit).not.toHaveBeenCalled();
      expect(
        await screen.findByText(
          'Domain must be a valid mail domain (e.g. example.com).'
        )
      ).toBeInTheDocument();
    });
  });
});
