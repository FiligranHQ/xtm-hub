import {
  NavigationLinkMenu,
  PublicSubLink,
} from '@/components/menu/navigation/shared/NavigationLinks';
import testRender from '@/utils/test/test-render';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { usePathname } from 'next/navigation';
import { describe, expect, it, vi } from 'vitest';

const LINK_HREF = '/en/link';
const LABEL = 'Tableaux de bord personnalisés';
const TestIcon = () => <svg />;

const mockTruncatedLabel = () => {
  const label = screen.getByText(LABEL);
  Object.defineProperty(label, 'scrollWidth', { value: 200 });
  Object.defineProperty(label, 'clientWidth', { value: 100 });
};

describe('PublicSubLink', () => {
  it('paints the gradient on the label of a highlighted, inactive link, not on the link itself', () => {
    // Given
    vi.mocked(usePathname).mockReturnValue('/en');

    // When
    testRender(
      <PublicSubLink
        href="/en/highlighted"
        label="Highlighted"
        highlight
      />
    );

    // Then
    expect(screen.getByText('Highlighted')).toHaveClass('text-gradient-focus');
    expect(screen.getByRole('link', { name: 'Highlighted' })).not.toHaveClass(
      'text-gradient-focus'
    );
  });

  it('should show the full label in a tooltip when the label is truncated', async () => {
    // Given
    const user = userEvent.setup();
    testRender(
      <PublicSubLink
        href={LINK_HREF}
        label={LABEL}
      />
    );
    mockTruncatedLabel();

    // When
    await user.tab();

    // Then
    expect(await screen.findByRole('tooltip')).toHaveTextContent(LABEL);
  });

  it('should show no tooltip when the label fits', async () => {
    // Given
    const user = userEvent.setup();
    testRender(
      <PublicSubLink
        href={LINK_HREF}
        label={LABEL}
      />
    );

    // When
    await user.tab();

    // Then
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });
});

describe('NavigationLinkMenu', () => {
  it('should show the full label in a tooltip when the label is truncated in the opened menu', async () => {
    // Given
    const user = userEvent.setup();
    testRender(
      <NavigationLinkMenu
        open
        href={LINK_HREF}
        icon={TestIcon}
        text={LABEL}
      />
    );
    mockTruncatedLabel();

    // When
    await user.tab();

    // Then
    expect(await screen.findByRole('tooltip')).toHaveTextContent(LABEL);
  });

  it('should show no tooltip when the menu is collapsed', async () => {
    // Given
    const user = userEvent.setup();
    testRender(
      <NavigationLinkMenu
        open={false}
        href={LINK_HREF}
        icon={TestIcon}
        text={LABEL}
      />
    );
    mockTruncatedLabel();

    // When
    await user.tab();

    // Then
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });
});
