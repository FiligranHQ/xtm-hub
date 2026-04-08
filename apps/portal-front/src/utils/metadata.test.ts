import { describe, expect, it, vi } from 'vitest';
import { getMetadataBase } from './metadata';

vi.mock('../../app/redirect/[identifier]/utils/load', () => ({
  loadBaseUrlFront: vi.fn(),
}));

import { loadBaseUrlFront } from '../../app/redirect/[identifier]/utils/load';

describe('getMetadataBase', () => {
  it.each`
    url                              | description
    ${'https://hub.filigran.io'}     | ${'HTTPS URL without trailing slash'}
    ${'http://localhost:3002'}       | ${'HTTP localhost with port'}
    ${'https://hub.filigran.io/'}    | ${'HTTPS URL with trailing slash'}
    ${'https://dev.hub.example.com'} | ${'subdomain URL'}
  `('returns a URL object for $description', async ({ url }) => {
    vi.mocked(loadBaseUrlFront).mockResolvedValue(url);

    const result = await getMetadataBase();

    expect(result).toBeInstanceOf(URL);
    expect(result.href).toBe(new URL(url).href);
  });

  it('returns a URL whose href matches the value from loadBaseUrlFront', async () => {
    const appUrl = 'https://hub.filigran.io';
    vi.mocked(loadBaseUrlFront).mockResolvedValue(appUrl);

    const result = await getMetadataBase();

    expect(result.href).toBe('https://hub.filigran.io/');
  });

  it('throws when loadBaseUrlFront returns an invalid URL', async () => {
    vi.mocked(loadBaseUrlFront).mockResolvedValue('not-a-valid-url');

    await expect(getMetadataBase()).rejects.toThrow();
  });

  it('throws when loadBaseUrlFront rejects', async () => {
    vi.mocked(loadBaseUrlFront).mockRejectedValue(new Error('Network error'));

    await expect(getMetadataBase()).rejects.toThrow('Network error');
  });
});
