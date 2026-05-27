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
    expect(screen.getByText('MenuLinks.Settings')).toBeInTheDocument();

    const settingsButton = screen.getByRole('button', {
      name: 'MenuLinks.Settings',
    });

    // Click it
    await user.click(settingsButton);

    // Check if it's expanded
    await waitFor(() => {
      expect(settingsButton).toHaveAttribute('aria-expanded', 'true');
      expect(settingsButton).toHaveAttribute('data-state', 'open');
    });
    expect(screen.getByText('MenuLinks.Parameter')).toBeInTheDocument();
    expect(screen.getByText('MenuLinks.Security')).toBeInTheDocument();
    expect(screen.getByText('MenuLinks.UseCase')).toBeInTheDocument();
    expect(screen.getByText('MenuLinks.Organization')).toBeInTheDocument();
    expect(screen.getByText('MenuLinks.Service')).toBeInTheDocument();
    expect(screen.getByText('MenuLinks.OpenCTITrial')).toBeInTheDocument();
    expect(screen.getByText('MenuLinks.OpenAEVTrial')).toBeInTheDocument();
    expect(screen.getByText('MenuLinks.Competitor')).toBeInTheDocument();
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
    expect(screen.getByText('MenuLinks.Settings')).toBeInTheDocument();

    const settingsButton = screen.getByRole('button', {
      name: 'MenuLinks.Settings',
    });

    // Click it
    await user.click(settingsButton);

    // Check if it's expanded
    await waitFor(() => {
      expect(settingsButton).toHaveAttribute('aria-expanded', 'true');
      expect(settingsButton).toHaveAttribute('data-state', 'open');
    });
    expect(screen.queryByText('MenuLinks.Parameter')).not.toBeInTheDocument();
    expect(screen.queryByText('MenuLinks.Security')).not.toBeInTheDocument();
    expect(screen.queryByText('MenuLinks.UseCase')).not.toBeInTheDocument();
    expect(
      screen.queryByText('MenuLinks.Organization')
    ).not.toBeInTheDocument();
    expect(screen.queryByText('MenuLinks.Service')).not.toBeInTheDocument();
    expect(screen.getByText('MenuLinks.OpenCTITrial')).toBeInTheDocument();
    expect(screen.getByText('MenuLinks.OpenAEVTrial')).toBeInTheDocument();
    expect(screen.queryByText('MenuLinks.Competitor')).not.toBeInTheDocument();
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
    expect(screen.getByText('MenuLinks.Settings')).toBeInTheDocument();

    const settingsButton = screen.getByRole('button', {
      name: 'MenuLinks.Settings',
    });

    // Click it
    await user.click(settingsButton);

    // Check if it's expanded
    await waitFor(() => {
      expect(settingsButton).toHaveAttribute('aria-expanded', 'true');
      expect(settingsButton).toHaveAttribute('data-state', 'open');
    });
    expect(screen.queryByText('MenuLinks.Parameter')).not.toBeInTheDocument();
    expect(screen.queryByText('MenuLinks.Security')).not.toBeInTheDocument();
    expect(screen.queryByText('MenuLinks.UseCase')).not.toBeInTheDocument();
    expect(
      screen.queryByText('MenuLinks.Organization')
    ).not.toBeInTheDocument();
    expect(screen.queryByText('MenuLinks.Service')).not.toBeInTheDocument();
    expect(
      screen.queryByText('MenuLinks.OpenCTITrial')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('MenuLinks.OpenAEVTrial')
    ).not.toBeInTheDocument();
    expect(screen.getByText('MenuLinks.Competitor')).toBeInTheDocument();
  });
});
