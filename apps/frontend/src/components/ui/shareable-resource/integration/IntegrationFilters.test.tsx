import testRender from '@/utils/test/test-render';
import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { IntegrationFilters } from './IntegrationFilters';

vi.mock(
  '@/components/ui/shareable-resource/integration/IntegrationTypeFilter',
  () => ({
    IntegrationTypeFilter: () => <div data-testid="integration-type-filter" />,
  })
);

describe('IntegrationFilters', () => {
  it('renders integration type filter wrapper', () => {
    const { container } = testRender(<IntegrationFilters />);

    expect(container.firstChild).toHaveClass(
      'flex',
      'justify-between',
      'gap-s'
    );
    expect(screen.getByTestId('integration-type-filter')).toBeInTheDocument();
  });
});
