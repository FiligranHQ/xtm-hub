import { UnauthenticatedError } from '@/lib/graphql-fetch.utils';
import { redirectToSignupOnUnauthenticated } from '@/lib/server-unauthenticated-redirect';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Mock } from 'vitest';

vi.mock('next/headers', () => ({ headers: vi.fn() }));

const REDIRECT_SENTINEL = new Error('NEXT_REDIRECT');

const mockPathname = (pathname: string | null) => {
  (headers as Mock).mockResolvedValue({
    get: (name: string) => (name === 'x-pathname' ? pathname : null),
  });
};

describe('redirectToSignupOnUnauthenticated', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Next.js' redirect never returns: it throws to interrupt the render.
    (redirect as unknown as Mock).mockImplementation(() => {
      throw REDIRECT_SENTINEL;
    });
    mockPathname('/app/catalog');
  });

  it('should return the data when the fetch succeeds', async () => {
    const result = await redirectToSignupOnUnauthenticated(async () => ({
      me: 'ok',
    }));

    expect(result).toEqual({ me: 'ok' });
    expect(redirect).not.toHaveBeenCalled();
  });

  it('should redirect to the signup page with the current path when unauthenticated', async () => {
    const fetchData = vi.fn().mockRejectedValue(new UnauthenticatedError());

    await expect(redirectToSignupOnUnauthenticated(fetchData)).rejects.toBe(
      REDIRECT_SENTINEL
    );

    expect(redirect).toHaveBeenCalledWith(
      `/sign-up?redirect=${encodeURIComponent(btoa('/app/catalog'))}`
    );
  });

  it('should redirect to the bare signup page when there is no current path', async () => {
    mockPathname(null);

    await expect(
      redirectToSignupOnUnauthenticated(() =>
        Promise.reject(new UnauthenticatedError())
      )
    ).rejects.toBe(REDIRECT_SENTINEL);

    expect(redirect).toHaveBeenCalledWith('/sign-up');
  });

  it('should rethrow any other error without redirecting', async () => {
    const failure = new Error('boom');

    await expect(
      redirectToSignupOnUnauthenticated(() => Promise.reject(failure))
    ).rejects.toBe(failure);

    expect(redirect).not.toHaveBeenCalled();
  });
});
