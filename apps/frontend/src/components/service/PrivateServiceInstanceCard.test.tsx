import testRender from '@/utils/test/test-render';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import PrivateServiceInstanceCard from './PrivateServiceInstanceCard';
import type { ServiceInstanceCardData } from './ServiceInstanceCard';

const buildServiceInstance = (
  overrides: Partial<ServiceInstanceCardData> = {}
): ServiceInstanceCardData => ({
  id: 'service-instance-id',
  name: 'OpenCTI',
  logoBackgroundImageUrl: null,
  illustrationDocumentUrl: null,
  url: '/internal/platform',
  ordering: 1,
  ...overrides,
});

describe('PrivateServiceInstanceCard', () => {
  it('keeps internal link without locale prefix', () => {
    const serviceInstance = buildServiceInstance({ url: '/internal/platform' });

    testRender(
      <PrivateServiceInstanceCard serviceInstance={serviceInstance} />
    );

    const titleLink = screen.getByRole('link', { name: 'OpenCTI' });
    expect(titleLink).toHaveAttribute('href', '/internal/platform');
    expect(titleLink).toHaveAttribute('target', '_self');
  });

  it('does not prefix external link', () => {
    const serviceInstance = buildServiceInstance({
      url: 'https://filigran.io',
    });

    testRender(
      <PrivateServiceInstanceCard serviceInstance={serviceInstance} />
    );

    const titleLink = screen.getByRole('link', { name: 'OpenCTI' });
    expect(titleLink).toHaveAttribute('href', 'https://filigran.io');
    expect(titleLink).toHaveAttribute('target', '_blank');
  });
});
