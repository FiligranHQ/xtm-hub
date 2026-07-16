import testRender from '@/utils/test/test-render';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ConnectProductButton from './ConnectProductButton';

// next-intl is mocked globally (setup-vitest.ts): useTranslations returns the key as-is
const CTA_KEY = 'Cta';

const openDropdown = async (user: ReturnType<typeof testRender>['user']) => {
  await user.click(screen.getByRole('button', { name: CTA_KEY }));
};

const getCloseButton = () =>
  screen
    .getAllByRole('button')
    .find((btn) => btn.textContent?.trim() !== CTA_KEY)!;

describe('ConnectProductButton', () => {
  describe('initial state', () => {
    it('renders the CTA button', () => {
      testRender(<ConnectProductButton />);

      expect(screen.getByRole('button', { name: CTA_KEY })).toBeInTheDocument();
    });

    it('does not show the dropdown', () => {
      testRender(<ConnectProductButton />);

      expect(
        screen.queryByRole('link', { name: 'OpenCTI' })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('link', { name: 'OpenAEV' })
      ).not.toBeInTheDocument();
    });
  });

  describe('when the CTA button is clicked', () => {
    it('shows the product dropdown', async () => {
      const { user } = testRender(<ConnectProductButton />);

      await openDropdown(user);

      expect(screen.getByRole('link', { name: 'OpenCTI' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'OpenAEV' })).toBeInTheDocument();
    });

    it('makes the trigger button invisible', async () => {
      const { user } = testRender(<ConnectProductButton />);

      const triggerButton = screen.getByRole('button', { name: CTA_KEY });
      await openDropdown(user);

      expect(triggerButton).toHaveClass('invisible');
    });
  });

  describe('product links', () => {
    it.each`
      label        | expectedHref
      ${'OpenCTI'} | ${'https://docs.opencti.io/latest/administration/hub/'}
      ${'OpenAEV'} | ${'https://docs.openaev.io/latest/administration/hub/'}
    `(
      '$label link points to $expectedHref and opens in a new tab',
      async ({
        label,
        expectedHref,
      }: {
        label: string;
        expectedHref: string;
      }) => {
        const { user } = testRender(<ConnectProductButton />);

        await openDropdown(user);

        const link = screen.getByRole('link', { name: label });
        expect(link).toHaveAttribute('href', expectedHref);
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      }
    );
  });

  describe('closing the dropdown', () => {
    it('hides the dropdown when the close button is clicked', async () => {
      const { user } = testRender(<ConnectProductButton />);

      await openDropdown(user);
      expect(screen.getByRole('link', { name: 'OpenCTI' })).toBeInTheDocument();

      await user.click(getCloseButton());

      expect(
        screen.queryByRole('link', { name: 'OpenCTI' })
      ).not.toBeInTheDocument();
    });

    it('restores trigger button visibility after closing', async () => {
      const { user } = testRender(<ConnectProductButton />);

      const triggerButton = screen.getByRole('button', { name: CTA_KEY });
      await openDropdown(user);
      await user.click(getCloseButton());

      expect(triggerButton).not.toHaveClass('invisible');
    });
  });
});
