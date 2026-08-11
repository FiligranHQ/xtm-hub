import testRender from '@/utils/test/test-render';
import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DisplayLogo } from './DisplayLogo';

const mocks = vi.hoisted(() => ({
  useTheme: vi.fn(),
}));

vi.mock('next-themes', () => ({
  useTheme: mocks.useTheme,
}));

vi.mock('@public/logo_xtm_hub_light.svg', () => ({
  default: ({ className }: { className?: string }) => (
    <svg
      data-testid="logo-light"
      className={className}
    />
  ),
}));

vi.mock('@public/logo_xtm_hub_dark.svg', () => ({
  default: ({ className }: { className?: string }) => (
    <svg
      data-testid="logo-dark"
      className={className}
    />
  ),
}));

describe('DisplayLogo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each`
    resolvedTheme | expectedVisible | expectedHidden
    ${'light'}    | ${'logo-light'} | ${'logo-dark'}
    ${'dark'}     | ${'logo-dark'}  | ${'logo-light'}
    ${undefined}  | ${'logo-dark'}  | ${'logo-light'}
  `(
    'renders $expectedVisible when resolvedTheme is $resolvedTheme',
    ({ resolvedTheme, expectedVisible, expectedHidden }) => {
      mocks.useTheme.mockReturnValue({ resolvedTheme });

      testRender(<DisplayLogo />);

      expect(screen.getByTestId(expectedVisible)).toBeInTheDocument();
      expect(screen.queryByTestId(expectedHidden)).not.toBeInTheDocument();
    }
  );

  it('forwards className to the rendered logo', () => {
    mocks.useTheme.mockReturnValue({ resolvedTheme: 'light' });

    testRender(<DisplayLogo className="h-8 w-8" />);

    expect(screen.getByTestId('logo-light')).toHaveClass('h-8 w-8');
  });
});
