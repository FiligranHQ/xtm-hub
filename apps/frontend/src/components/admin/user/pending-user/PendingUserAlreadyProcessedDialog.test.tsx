import { screen } from '@testing-library/react';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import testRender from '@/utils/test/test-render';
import { PendingUserAlreadyProcessedDialog } from './PendingUserAlreadyProcessedDialog';

vi.mock('@/components/ui/AlertDialog', () => ({
  AlertDialogComponent: ({
    isOpen,
    onOpenChange,
    AlertTitle,
    actionButtonText,
    onClickContinue,
    children,
  }: {
    isOpen?: boolean;
    onOpenChange?: (isOpen: boolean) => void;
    AlertTitle: string;
    actionButtonText: string;
    onClickContinue?: () => void;
    children: ReactNode;
  }) =>
    isOpen ? (
      <div role="alertdialog">
        <h2>{AlertTitle}</h2>
        <div>{children}</div>
        <button onClick={onClickContinue}>{actionButtonText}</button>
        <button onClick={() => onOpenChange?.(false)}>Close</button>
      </div>
    ) : null,
}));

describe('PendingUserAlreadyProcessedDialog', () => {
  beforeEach(() => {
    vi.mocked(useTranslations).mockReturnValue((key) => key);
  });

  it('does not render when closed', () => {
    testRender(
      <PendingUserAlreadyProcessedDialog
        isOpen={false}
        onOpenChange={vi.fn()}
      />
    );

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('renders translation keys and closes on confirm', async () => {
    const onOpenChange = vi.fn();
    const { user } = testRender(
      <PendingUserAlreadyProcessedDialog
        isOpen={true}
        onOpenChange={onOpenChange}
      />
    );

    expect(
      screen.getByText('PendingUserListPage.AlreadyProcessed.Title')
    ).toBeInTheDocument();
    expect(
      screen.getByText('PendingUserListPage.AlreadyProcessed.Description')
    ).toBeInTheDocument();
    expect(
      screen.getByText('PendingUserListPage.AlreadyProcessed.Confirm')
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', {
        name: 'PendingUserListPage.AlreadyProcessed.Confirm',
      })
    );

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('closes when the close handler fires', async () => {
    const onOpenChange = vi.fn();
    const { user } = testRender(
      <PendingUserAlreadyProcessedDialog
        isOpen={true}
        onOpenChange={onOpenChange}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Close' }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
