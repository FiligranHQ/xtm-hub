import testRender from '@/utils/test/test-render';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CONNECTABLE_PLATFORMS } from '../connected-products/ConnectedProductsDropdown';
import ConnectProductsButton from './ConnectProductsButton';

// next-intl is mocked globally (setup-vitest.ts): useTranslations returns the key as-is
const CTA_KEY = 'Cta';
const CONNECT_BUTTON_KEY = 'Header.ConnectedProducts.ConnectPlatform';

const openDropdown = async (user: ReturnType<typeof testRender>['user']) => {
  await user.click(screen.getByRole('button', { name: CTA_KEY }));
};

const getCloseButton = () =>
  screen
    .getAllByRole('button')
    .find((btn) => btn.textContent?.trim() !== CTA_KEY)!;

describe('ConnectProductsButton', () => {
  describe('initial state', () => {
    it('renders the CTA button', () => {
      testRender(<ConnectProductsButton />);

      expect(screen.getByRole('button', { name: CTA_KEY })).toBeInTheDocument();
    });

    it('does not show the dropdown', () => {
      testRender(<ConnectProductsButton />);

      expect(
        screen.queryByRole('button', { name: CONNECT_BUTTON_KEY })
      ).not.toBeInTheDocument();
    });
  });

  describe('when the CTA button is clicked', () => {
    it('shows the product dropdown', async () => {
      const { user } = testRender(<ConnectProductsButton />);

      await openDropdown(user);

      expect(
        screen.getAllByRole('button', { name: CONNECT_BUTTON_KEY })
      ).toHaveLength(CONNECTABLE_PLATFORMS.length);
    });

    it('makes the trigger button invisible', async () => {
      const { user } = testRender(<ConnectProductsButton />);

      const triggerButton = screen.getByRole('button', { name: CTA_KEY });
      await openDropdown(user);

      expect(triggerButton).toHaveClass('invisible');
    });
  });

  describe('connect actions', () => {
    it('renders one connect button per connectable platform', async () => {
      const { user } = testRender(<ConnectProductsButton />);

      await openDropdown(user);

      expect(
        screen.getAllByRole('button', { name: CONNECT_BUTTON_KEY })
      ).toHaveLength(CONNECTABLE_PLATFORMS.length);
    });
  });

  describe('closing the dropdown', () => {
    it('hides the dropdown when the close button is clicked', async () => {
      const { user } = testRender(<ConnectProductsButton />);

      await openDropdown(user);
      expect(
        screen.getAllByRole('button', { name: CONNECT_BUTTON_KEY })
      ).toHaveLength(CONNECTABLE_PLATFORMS.length);

      await user.click(getCloseButton());

      expect(
        screen.queryByRole('button', { name: CONNECT_BUTTON_KEY })
      ).not.toBeInTheDocument();
    });

    it('restores trigger button visibility after closing', async () => {
      const { user } = testRender(<ConnectProductsButton />);

      const triggerButton = screen.getByRole('button', { name: CTA_KEY });
      await openDropdown(user);
      await user.click(getCloseButton());

      expect(triggerButton).not.toHaveClass('invisible');
    });
  });
});
