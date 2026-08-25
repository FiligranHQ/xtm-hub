import { PlatformMetadataMapping } from '@/components/registration/PlatformIdentifierMapping';
import { PlatformIdentifier } from '@graphql/generated';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('PlatformMetadataMapping', () => {
  it('renders the XTM One icon for the xtmone placeholder entry', () => {
    const { Icon } = PlatformMetadataMapping[PlatformIdentifier.Xtmone];
    const { container } = render(<Icon className="size-6" />);

    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(container.querySelector('svg')).toHaveClass('size-6');
  });
});
