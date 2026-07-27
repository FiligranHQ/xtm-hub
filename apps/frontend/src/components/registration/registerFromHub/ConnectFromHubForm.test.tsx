import ConnectFromHubForm, {
  CONNECTABLE_PRODUCTS,
} from '@/components/registration/registerFromHub/ConnectFromHubForm';
import testRender from '@/utils/test/test-render';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

describe('ConnectFromHubForm', () => {
  it('renders product combobox and url input', () => {
    testRender(<ConnectFromHubForm onSubmit={vi.fn()} />);

    expect(screen.getByRole('combobox')).toHaveTextContent(
      CONNECTABLE_PRODUCTS.OpenCTI
    );
    expect(
      screen.getByPlaceholderText('Register.Details.ProductURL')
    ).toBeInTheDocument();
  });

  it('submits selected product and URL', async () => {
    const onSubmit = vi.fn();
    const { user } = testRender(<ConnectFromHubForm onSubmit={onSubmit} />);

    const productSelect = document.querySelector(
      'select[name="product"]'
    ) as HTMLSelectElement | null;
    expect(productSelect).not.toBeNull();
    fireEvent.change(productSelect!, {
      target: { value: CONNECTABLE_PRODUCTS.OpenAEV },
    });
    await user.type(
      screen.getByPlaceholderText('Register.Details.ProductURL'),
      'https://openaev.example.com'
    );
    await user.click(screen.getByRole('button', { name: 'Utils.Continue' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0]?.[0]).toEqual({
        product: CONNECTABLE_PRODUCTS.OpenAEV,
        productUrl: 'https://openaev.example.com',
      });
    });
  });
});
