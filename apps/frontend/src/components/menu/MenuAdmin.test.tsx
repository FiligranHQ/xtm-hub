import testRender from '@/utils/test/test-render';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it } from 'vitest';
import MenuAdmin from './MenuAdmin';

describe('render MenuAdmin', () => {
  it('should render admin panel with all the menu with BYPASS capabilities', async () => {
    const user = userEvent.setup();
    const { container } = testRender(<MenuAdmin open={true} />, {
      me: {
        capabilities: [
          {
            name: 'BYPASS',
          },
        ],
      },
    });
    expect(container).toBeTruthy();
    expect(screen.getByText('Settings')).toBeInTheDocument();

    const settingsButton = screen.getByRole('button', { name: /settings/i });

    // Click it
    await user.click(settingsButton);

    // Check if it's expanded
    await waitFor(() => {
      expect(settingsButton).toHaveAttribute('aria-expanded', 'true');
      expect(settingsButton).toHaveAttribute('data-state', 'open');
    });
    expect(screen.getByText('Parameter')).toBeInTheDocument();
    expect(screen.getByText('Security')).toBeInTheDocument();
    expect(screen.getByText('Use Case')).toBeInTheDocument();
    expect(screen.getByText('Organization')).toBeInTheDocument();
    expect(screen.getByText('Service')).toBeInTheDocument();
    expect(screen.getByText('OpenCTI Trial')).toBeInTheDocument();
    expect(screen.getByText('OpenAEV Trial')).toBeInTheDocument();
    expect(screen.getByText('Competitor')).toBeInTheDocument();
    expect(screen.getByText('News Feed')).toBeInTheDocument();
  });

  it('should render admin panel with only Trials dashboard in the menu with READ_TRIALS capabilities', async () => {
    const user = userEvent.setup();
    const { container } = testRender(<MenuAdmin open={true} />, {
      me: {
        capabilities: [
          {
            name: 'READ_TRIALS',
          },
        ],
      },
    });
    expect(container).toBeTruthy();
    expect(screen.getByText('Settings')).toBeInTheDocument();

    const settingsButton = screen.getByRole('button', { name: /settings/i });

    // Click it
    await user.click(settingsButton);

    // Check if it's expanded
    await waitFor(() => {
      expect(settingsButton).toHaveAttribute('aria-expanded', 'true');
      expect(settingsButton).toHaveAttribute('data-state', 'open');
    });
    expect(screen.queryByText('Parameter')).not.toBeInTheDocument();
    expect(screen.queryByText('Security')).not.toBeInTheDocument();
    expect(screen.queryByText('Use Case')).not.toBeInTheDocument();
    expect(screen.queryByText('Organization')).not.toBeInTheDocument();
    expect(screen.queryByText('Service')).not.toBeInTheDocument();
    expect(screen.getByText('OpenCTI Trial')).toBeInTheDocument();
    expect(screen.getByText('OpenAEV Trial')).toBeInTheDocument();
    expect(screen.queryByText('Competitor')).not.toBeInTheDocument();
    expect(screen.queryByText('News Feed')).not.toBeInTheDocument();
  });
  it('should render admin panel with only Trials dashboards and competitors in the menu with MANAGE_COMPETITOR capabilities', async () => {
    const user = userEvent.setup();
    const { container } = testRender(<MenuAdmin open={true} />, {
      me: {
        capabilities: [
          {
            name: 'MODIFY_COMPETITORS',
          },
        ],
      },
    });
    expect(container).toBeTruthy();
    expect(screen.getByText('Settings')).toBeInTheDocument();

    const settingsButton = screen.getByRole('button', { name: /settings/i });

    // Click it
    await user.click(settingsButton);

    // Check if it's expanded
    await waitFor(() => {
      expect(settingsButton).toHaveAttribute('aria-expanded', 'true');
      expect(settingsButton).toHaveAttribute('data-state', 'open');
    });
    expect(screen.queryByText('Parameter')).not.toBeInTheDocument();
    expect(screen.queryByText('Security')).not.toBeInTheDocument();
    expect(screen.queryByText('Use Case')).not.toBeInTheDocument();
    expect(screen.queryByText('Organization')).not.toBeInTheDocument();
    expect(screen.queryByText('Service')).not.toBeInTheDocument();
    expect(screen.queryByText('OpenCTI Trial')).not.toBeInTheDocument();
    expect(screen.queryByText('OpenAEV Trial')).not.toBeInTheDocument();
    expect(screen.getByText('Competitor')).toBeInTheDocument();
    expect(screen.queryByText('News Feed')).not.toBeInTheDocument();
  });
});
