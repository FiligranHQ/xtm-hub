import { logFrontendError } from '@/components/error-frontend-log.graphql';
import PublicPathError from '@/components/PublicPathError';
import { isProduction } from '@/lib/utils';
import testRender from '@/utils/test/test-render';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/utils', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/utils')>()),
  isProduction: vi.fn(),
}));

vi.mock('@public/logo_xtm_hub_light.svg', () => ({
  default: () => <svg data-testid="logo-light" />,
}));

vi.mock('@public/logo_xtm_hub_dark.svg', () => ({
  default: () => <svg data-testid="logo-dark" />,
}));

describe('PublicPathError', () => {
  beforeEach(() => {
    vi.mocked(isProduction).mockReturnValue(true);
  });

  it('reports the error via logFrontendError in production by default (genuine unexpected errors, e.g. an error.tsx boundary)', () => {
    testRender(
      <PublicPathError
        error={{ name: 'Error', message: 'boom', stack: 'stack-trace' }}
      />
    );

    expect(logFrontendError).toHaveBeenCalledWith(
      expect.anything(),
      'boom',
      'stack-trace',
      undefined
    );
  });

  it('does not report the error when shouldLog is false (expected 404s, e.g. the root not-found.tsx)', () => {
    testRender(
      <PublicPathError
        shouldLog={false}
        error={{ name: 'PageNotFoundError', message: 'unknown path' }}
      />
    );

    expect(logFrontendError).not.toHaveBeenCalled();
  });

  it('never reports outside of production, even when shouldLog is true', () => {
    vi.mocked(isProduction).mockReturnValue(false);

    testRender(
      <PublicPathError
        error={{ name: 'Error', message: 'boom' }}
      />
    );

    expect(logFrontendError).not.toHaveBeenCalled();
  });
});
