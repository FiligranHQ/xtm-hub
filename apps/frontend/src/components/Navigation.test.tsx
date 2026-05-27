import { NavigationApp } from '@/components/Navigation';
import testRender from '@/utils/test/test-render';
import { screen } from '@testing-library/react';
import { describe, it } from 'vitest';

describe('NavigationApp display', () => {
  it('should not render admin panel without capabilities ', async () => {
    const { container } = testRender(<NavigationApp open={true} />);
    expect(container).toBeTruthy();
    expect(screen.queryByText('MenuLinks.Settings')).not.toBeInTheDocument();
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
    expect(screen.queryByText('MenuLinks.Settings')).toBeInTheDocument();
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
    expect(screen.queryByText('MenuLinks.Settings')).toBeInTheDocument();
  });
});
