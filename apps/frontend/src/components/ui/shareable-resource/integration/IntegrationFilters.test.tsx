import testRender from '@/utils/test/test-render';
import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { IntegrationFilters } from './IntegrationFilters';

vi.mock('@/hooks/use-service-list-local-storage', () => ({
  ServiceListLocalStorageKey: { OpenCTIIntegrationFeeds: 'feeds' },
  useServiceListLocalStorage: () => ({
    integrationTypes: {},
    setIntegrationTypes: vi.fn(),
    removeIntegrationTypes: vi.fn(),
  }),
}));

vi.mock('@/hooks/use-service-list-filters', () => ({
  useServiceListFilters: () => ({ removeFilter: vi.fn() }),
}));

describe('IntegrationFilters', () => {
  it('renders the filter wrapper with the correct layout classes', () => {
    const { container } = testRender(<IntegrationFilters />);

    expect(container.firstChild).toHaveClass(
      'flex',
      'justify-between',
      'gap-s'
    );
    expect(
      screen.getByText('Service.OpenctiIntegrations.Filter.Type.Placeholder')
    ).toBeInTheDocument();
  });
});
