import ConnectFromHubForm from '@/components/registration/registerFromHub/ConnectFromHubForm';
import testRender from '@/utils/test/test-render';
import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

describe('ConnectFromHubForm', () => {
  it('renders provided product values', () => {
    testRender(
      <ConnectFromHubForm
        onSubmit={vi.fn()}
        values={{
          productName: 'OpenCTI',
          productUrl: 'https://opencti.example.com',
        }}
      />
    );

    expect(screen.getByDisplayValue('OpenCTI')).toBeInTheDocument();
    expect(
      screen.getByDisplayValue('https://opencti.example.com')
    ).toBeInTheDocument();
  });

  it('submits trimmed product values', async () => {
    const onSubmit = vi.fn();
    const { user } = testRender(<ConnectFromHubForm onSubmit={onSubmit} />);

    await user.type(
      screen.getByPlaceholderText('Register.Details.ProductName'),
      '  OpenAEV  '
    );
    await user.type(
      screen.getByPlaceholderText('Register.Details.ProductURL'),
      '  https://openaev.example.com  '
    );
    await user.click(screen.getByRole('button', { name: 'Utils.Continue' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0]?.[0]).toEqual({
        productName: 'OpenAEV',
        productUrl: 'https://openaev.example.com',
      });
    });
  });
});
