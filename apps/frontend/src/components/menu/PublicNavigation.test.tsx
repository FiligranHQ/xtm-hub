import testRender from '@/utils/test/test-render';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { usePathname } from 'next/navigation';
import { describe, expect, it, vi } from 'vitest';
import PublicNavigation from './PublicNavigation';

const expandSection = async (
  user: ReturnType<typeof userEvent.setup>,
  name: string
) => {
  const trigger = screen.getByRole('button', { name });
  await user.click(trigger);
  await waitFor(() => {
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });
  return trigger;
};

describe('PublicNavigation — open={true}', () => {
  it('renders all section labels in the accordion', () => {
    testRender(<PublicNavigation open={true} />);

    expect(screen.getByText('PublicMenu.XTMPlatform')).toBeInTheDocument();
    // Hardcoded labels
    expect(screen.getByText('OpenCTI')).toBeInTheDocument();
    expect(screen.getByText('OpenAEV')).toBeInTheDocument();
    expect(screen.getByText('XTM One')).toBeInTheDocument();
  });

  it('renders bottom links with their labels', () => {
    testRender(<PublicNavigation open={true} />);

    expect(screen.getByText('PublicMenu.XTMRoadmap')).toBeInTheDocument();
    expect(screen.getByText('PublicMenu.FiligranAcademy')).toBeInTheDocument();
    expect(screen.getByText('PublicMenu.Blog')).toBeInTheDocument();
    expect(screen.getByText('PublicMenu.Slack')).toBeInTheDocument();
  });

  it('XTM Platform renders as a link, not an accordion trigger', () => {
    testRender(<PublicNavigation open={true} />);

    // LinkedSection renders a plain <a> (via next/link), not a button with aria-expanded
    const xtmPlatformLink = screen.getByRole('link', {
      name: /PublicMenu\.XTMPlatform/,
    });
    expect(xtmPlatformLink).toBeInTheDocument();
    expect(xtmPlatformLink).not.toHaveAttribute('aria-expanded');
  });

  it('expanding the OpenCTI accordion shows its sub-links', async () => {
    const user = userEvent.setup();
    testRender(<PublicNavigation open={true} />);

    await expandSection(user, 'OpenCTI');

    expect(screen.getByText('PublicMenu.StartFreeTrial')).toBeInTheDocument();
    expect(screen.getByText('PublicMenu.CustomDashboards')).toBeInTheDocument();
    expect(screen.getByText('PublicMenu.Integrations')).toBeInTheDocument();
    expect(screen.getByText('PublicMenu.LiveDemo')).toBeInTheDocument();
    expect(screen.getByText('PublicMenu.Documentation')).toBeInTheDocument();
  });

  it('expanding the OpenAEV accordion shows its sub-links', async () => {
    const user = userEvent.setup();
    testRender(<PublicNavigation open={true} />);

    await expandSection(user, 'OpenAEV');

    expect(screen.getByText('PublicMenu.StartFreeTrial')).toBeInTheDocument();
    expect(screen.getByText('PublicMenu.Scenarios')).toBeInTheDocument();
  });

  it('expanding XTM One accordion shows the badge-only AI Catalog entry', async () => {
    const user = userEvent.setup();
    testRender(<PublicNavigation open={true} />);

    await expandSection(user, 'XTM One');

    expect(screen.getByText('PublicMenu.AICatalog')).toBeInTheDocument();
    expect(screen.getByText('PublicMenu.ComingSoon')).toBeInTheDocument();
  });

  it('external sub-links have target="_blank" and rel="noopener noreferrer"', async () => {
    const user = userEvent.setup();
    testRender(<PublicNavigation open={true} />);

    await expandSection(user, 'OpenCTI');

    const liveDemoLinks = screen.getAllByRole('link', {
      name: /PublicMenu\.LiveDemo/,
    });
    // At least one "Live Demo" link should be external
    const externalLink = liveDemoLinks.find(
      (l) => l.getAttribute('target') === '_blank'
    );
    expect(externalLink).toBeDefined();
    expect(externalLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('applies active styles to the link matching the current pathname', () => {
    vi.mocked(usePathname).mockReturnValue('/en');
    testRender(<PublicNavigation open={true} />);

    const xtmPlatformLink = screen.getByRole('link', {
      name: /PublicMenu\.XTMPlatform/,
    });
    // Active class contains bg-primary/10
    expect(xtmPlatformLink.className).toContain('bg-primary/10');
  });

  it('does not apply active styles to links that do not match the current pathname', () => {
    vi.mocked(usePathname).mockReturnValue('/en');
    testRender(<PublicNavigation open={true} />);

    // The roadmap bottom link href is /en/cybersecurity-solutions/xtm-platform-roadmap
    // which does NOT equal /en
    const roadmapLink = screen.getByRole('link', {
      name: /PublicMenu\.XTMRoadmap/,
    });
    expect(roadmapLink.className).not.toContain('bg-primary/10');
  });

  it('locale is injected into internal link hrefs', async () => {
    const user = userEvent.setup();
    testRender(<PublicNavigation open={true} />);

    await expandSection(user, 'OpenCTI');

    const dashboardsLink = screen.getByRole('link', {
      name: 'PublicMenu.CustomDashboards',
    });
    expect(dashboardsLink).toHaveAttribute(
      'href',
      '/en/cybersecurity-solutions/opencti-custom-dashboards'
    );
  });

  it('XTM One badge-only entry renders without a link', async () => {
    const user = userEvent.setup();
    testRender(<PublicNavigation open={true} />);

    await expandSection(user, 'XTM One');

    const aiCatalogText = screen.getByText('PublicMenu.AICatalog');
    // Rendered as a <span>, not a link
    expect(aiCatalogText.closest('a')).toBeNull();
  });
});

describe('PublicNavigation — open={false}', () => {
  it('renders section buttons with aria-labels for accessibility', () => {
    testRender(<PublicNavigation open={false} />);

    expect(screen.getByRole('button', { name: 'OpenCTI' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'OpenAEV' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'XTM One' })).toBeInTheDocument();
  });

  it('section labels are visually hidden (sr-only) in closed mode', () => {
    testRender(<PublicNavigation open={false} />);

    // Bottom links use PublicLinkMenu which renders the label with sr-only when closed
    const roadmapLabel = screen.getByText('PublicMenu.XTMRoadmap');
    expect(roadmapLabel.className).toContain('sr-only');
  });

  it('XTM Platform renders as a link with aria-label in closed mode', () => {
    testRender(<PublicNavigation open={false} />);

    const xtmLink = screen.getByRole('link', {
      name: 'PublicMenu.XTMPlatform',
    });
    expect(xtmLink).toBeInTheDocument();
  });

  it('hovering a closed section button opens the popover with sub-links', async () => {
    const user = userEvent.setup();
    testRender(<PublicNavigation open={false} />);

    const openctiButton = screen.getByRole('button', { name: 'OpenCTI' });
    await user.hover(openctiButton);

    await waitFor(() => {
      expect(screen.getByText('PublicMenu.StartFreeTrial')).toBeInTheDocument();
    });
  });

  it('moving the mouse away from a closed section closes the popover', async () => {
    const user = userEvent.setup();
    testRender(<PublicNavigation open={false} />);

    const openctiButton = screen.getByRole('button', { name: 'OpenCTI' });
    await user.hover(openctiButton);

    await waitFor(() => {
      expect(screen.getByText('PublicMenu.StartFreeTrial')).toBeInTheDocument();
    });

    await user.unhover(openctiButton);

    await waitFor(() => {
      expect(
        screen.queryByText('PublicMenu.StartFreeTrial')
      ).not.toBeInTheDocument();
    });
  });
});
