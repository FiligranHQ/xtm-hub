import { serverFetchGraphQL } from '@/relay/server-portal-api-fetch';
import { fetchSeoServiceInstanceBySlug } from '@/utils/seo-service-instance/utils/seo-service-instance.server.utils';
import { notFound } from 'next/navigation';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/relay/server-portal-api-fetch', () => ({
  serverFetchGraphQL: vi.fn(),
}));

describe('fetchSeoServiceInstanceBySlug', () => {
  it('returns the service instance when the query resolves with data', async () => {
    const serviceInstance = { id: 'service-1', slug: 'opencti' };
    vi.mocked(serverFetchGraphQL).mockResolvedValue({
      data: { seoServiceInstance: serviceInstance },
    } as never);

    await expect(fetchSeoServiceInstanceBySlug('opencti')).resolves.toEqual(
      serviceInstance
    );
    expect(notFound).not.toHaveBeenCalled();
  });

  it('calls Next.js notFound() instead of letting the error bubble up when the backend throws SERVICE_NOT_FOUND (non-public or unknown slug)', async () => {
    vi.mocked(serverFetchGraphQL).mockRejectedValue(
      new Error('SERVICE_NOT_FOUND')
    );

    await expect(
      fetchSeoServiceInstanceBySlug('non-public-or-unknown-slug')
    ).rejects.toThrow('NEXT_NOT_FOUND');
    expect(notFound).toHaveBeenCalledTimes(1);
  });

  it('calls Next.js notFound() when the query resolves without an error but with no service instance', async () => {
    vi.mocked(serverFetchGraphQL).mockResolvedValue({
      data: { seoServiceInstance: null },
    } as never);

    await expect(
      fetchSeoServiceInstanceBySlug('unknown-slug')
    ).rejects.toThrow('NEXT_NOT_FOUND');
    expect(notFound).toHaveBeenCalledTimes(1);
  });
});
