import { UnauthenticatedError } from '@/lib/graphql-fetch.utils';
import { RequestParameters } from 'relay-runtime';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { networkFetch } from './fetch-fn';

vi.mock('graphql-sse', () => ({
  createClient: vi.fn(() => ({ subscribe: vi.fn() })),
}));

const mockRequest: RequestParameters = {
  id: null,
  name: 'TestQuery',
  text: '{ __typename }',
  operationKind: 'query',
  metadata: {},
};

function mockFetchResponse(body: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({ json: () => Promise.resolve(body) })
  );
}

describe('networkFetch', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should throw UnauthenticatedError when response has extensions.code UNAUTHENTICATED', async () => {
    mockFetchResponse({
      errors: [
        {
          message: 'Not authorized: You are not authenticated',
          extensions: { code: 'UNAUTHENTICATED' },
        },
      ],
    });

    await expect(
      networkFetch({ request: mockRequest, variables: {} })
    ).rejects.toThrow(UnauthenticatedError);
  });

  it('should not throw UnauthenticatedError for FORBIDDEN_ACCESS errors', async () => {
    mockFetchResponse({
      errors: [
        { message: 'Forbidden', extensions: { code: 'FORBIDDEN_ACCESS' } },
      ],
    });

    await expect(
      networkFetch({ request: mockRequest, variables: {} })
    ).rejects.toThrow('Forbidden');

    await expect(
      networkFetch({ request: mockRequest, variables: {} })
    ).rejects.not.toThrow(UnauthenticatedError);
  });

  it('should not throw UnauthenticatedError when errors have no extensions', async () => {
    mockFetchResponse({
      errors: [{ message: 'Some error' }],
    });

    await expect(
      networkFetch({ request: mockRequest, variables: {} })
    ).rejects.toThrow('Some error');
  });

  it('should return data when response has no errors', async () => {
    const mockData = { data: { user: { id: '1' } } };
    mockFetchResponse(mockData);

    const result = await networkFetch({ request: mockRequest, variables: {} });

    expect(result).toEqual(mockData);
  });
});

describe('subscriptionsClient', () => {
  it('should create the graphql-sse client with singleConnection enabled to multiplex all subscriptions over one SSE connection', async () => {
    vi.resetModules();
    const { createClient } = await import('graphql-sse');
    await import('./fetch-fn');

    expect(createClient).toHaveBeenCalledWith(
      expect.objectContaining({
        url: '/graphql-sse',
        singleConnection: true,
      })
    );
  });
});
