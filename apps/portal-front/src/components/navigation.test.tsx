import { NavigationApp } from '@/components/navigation';
import testRender from '@/utils/test/test-render';
import { screen } from '@testing-library/react';
import { describe, it, vi } from 'vitest';

// Mock next/navigation properly for App Router
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/mock'),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  })),
  useParams: vi.fn(() => ({})),
}));

describe('NavigationApp display', () => {
  it('should not render admin panel without capabilities ', async () => {
    const { container } = testRender(<NavigationApp open={true} />);
    expect(container).toBeTruthy();
    expect(screen.queryByText('Settings')).not.toBeInTheDocument();
  });
  it('should render admin panel with BYPASS capabilities', async () => {
    const { container } = testRender(<NavigationApp open={true} />, {
      me: {
        capabilities: [
          {
            name: 'BYPASS',
          },
        ],
      },
    });
    expect(container).toBeTruthy();
    expect(screen.queryByText('Settings')).toBeInTheDocument();
  });
  it('should render admin panel with READ_TRIALS capabilities', async () => {
    const { container } = testRender(<NavigationApp open={true} />, {
      me: {
        capabilities: [
          {
            name: 'READ_TRIALS',
          },
        ],
      },
    });
    expect(container).toBeTruthy();
    expect(screen.queryByText('Settings')).toBeInTheDocument();
  });
});
