import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ShareableResourceEntityTypes } from './ShareableResourceEntityTypes';

vi.mock('@/utils/shareable-resources/entity-type', () => ({
  getEntityTypeLabel: (id: string) => `label:${id}`,
  EntityTypeIcon: ({ entityType }: { entityType: string }) => (
    <svg
      data-testid="entity-icon"
      data-entity={entityType}
    />
  ),
}));

describe('ShareableResourceEntityTypes', () => {
  it('renders nothing when entity_types is empty', () => {
    const { container } = render(
      <ShareableResourceEntityTypes document={{ entity_types: [] }} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when entity_types is null', () => {
    const { container } = render(
      <ShareableResourceEntityTypes document={{ entity_types: null }} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when entity_types is undefined', () => {
    const { container } = render(
      <ShareableResourceEntityTypes document={{}} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders a badge with an icon and label for each entity type', () => {
    render(
      <ShareableResourceEntityTypes
        document={{ entity_types: ['Attack-Pattern', 'Campaign'] }}
      />
    );

    const icons = screen.getAllByTestId('entity-icon');
    expect(icons).toHaveLength(2);
    expect(icons.map((icon) => icon.getAttribute('data-entity'))).toEqual([
      'Attack-Pattern',
      'Campaign',
    ]);

    expect(screen.getByText('label:Attack-Pattern')).toBeInTheDocument();
    expect(screen.getByText('label:Campaign')).toBeInTheDocument();
  });

  it('applies the custom className to the container', () => {
    const { container } = render(
      <ShareableResourceEntityTypes
        document={{ entity_types: ['Malware'] }}
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});
