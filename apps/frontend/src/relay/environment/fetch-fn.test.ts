import { RequestParameters } from 'relay-runtime';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { networkFetch, UnauthenticatedError } from './fetch-fn';

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
