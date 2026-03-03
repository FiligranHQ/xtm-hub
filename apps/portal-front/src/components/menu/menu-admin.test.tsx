import testRender from '@/utils/test/test-render';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it } from 'vitest';
import MenuAdmin from './menu-admin';

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
    expect(screen.getByText('Parameters')).toBeInTheDocument();
    expect(screen.getByText('Security')).toBeInTheDocument();
    expect(screen.getByText('Use Cases')).toBeInTheDocument();
    expect(screen.getByText('Organizations')).toBeInTheDocument();
    expect(screen.getByText('Services')).toBeInTheDocument();
    expect(screen.getByText('OpenCTI Trials')).toBeInTheDocument();
    expect(screen.getByText('OpenAEV Trials')).toBeInTheDocument();
    expect(screen.getByText('Competitors')).toBeInTheDocument();
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
    expect(screen.queryByText('Parameters')).not.toBeInTheDocument();
    expect(screen.queryByText('Security')).not.toBeInTheDocument();
    expect(screen.queryByText('Use Cases')).not.toBeInTheDocument();
    expect(screen.queryByText('Organizations')).not.toBeInTheDocument();
    expect(screen.queryByText('Services')).not.toBeInTheDocument();
    expect(screen.getByText('OpenCTI Trials')).toBeInTheDocument();
    expect(screen.getByText('OpenAEV Trials')).toBeInTheDocument();
    expect(screen.queryByText('Competitors')).not.toBeInTheDocument();
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
    expect(screen.queryByText('Parameters')).not.toBeInTheDocument();
    expect(screen.queryByText('Security')).not.toBeInTheDocument();
    expect(screen.queryByText('Use Cases')).not.toBeInTheDocument();
    expect(screen.queryByText('Organizations')).not.toBeInTheDocument();
    expect(screen.queryByText('Services')).not.toBeInTheDocument();
    expect(screen.queryByText('OpenCTI Trials')).not.toBeInTheDocument();
    expect(screen.queryByText('OpenAEV Trials')).not.toBeInTheDocument();
    expect(screen.getByText('Competitors')).toBeInTheDocument();
  });
});
