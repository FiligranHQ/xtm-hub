import testRender from '@/utils/test/test-render';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { createMockEnvironment } from 'relay-test-utils';
import { describe, expect, it, vi } from 'vitest';
import { TrialCancelSheet } from './TrialCancelSheet';

let lastCancelDeploymentRequestVariables: Record<string, unknown> | null = null;

vi.mock('next/navigation', (importOriginal) => ({
  ...importOriginal(),
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock('next-intl', async (importOriginal) => ({
  ...(await importOriginal()),
  useTranslations: () => (key: string) => key,
}));
vi.mock('@/components/service/trial-instances/useOrgaFreeTrials', () => ({
  useOrgaFreeTrial: () => ({ refetch: vi.fn() }),
}));
vi.mock('react-relay', async (importOriginal) => ({
  ...(await importOriginal()),
  useMutation: () => [
    (opts: {
      variables: Record<string, unknown>;
      onCompleted?: (data: unknown) => void;
      onError?: (err: Error) => void;
    }) => {
      lastCancelDeploymentRequestVariables = opts.variables;
      opts.onCompleted?.({
        cancelDeploymentRequest: { counts_in_orga_quota: false },
      });
    },
    {},
  ],
}));
type AutoFormProps = {
  onSubmit: (values: Record<string, unknown>) => void;
  children: React.ReactNode;
  [key: string]: unknown;
};
vi.mock('@filigran/ui', async (importOriginal) => {
  return {
    ...(await importOriginal()),
    toast: vi.fn(),
    AutoForm: ({ onSubmit, children, ...props }: AutoFormProps) => (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit({ cancellation_reason: 'Test reason' });
        }}
        {...props}>
        {children}
        <button type="submit">Submit</button>
      </form>
    ),
  };
});

describe('TrialCancelSheet', () => {
  beforeEach(() => {
    lastCancelDeploymentRequestVariables = null;
  });

  it('should render and submit cancellation reason', async () => {
    const environment = createMockEnvironment();
    const setOpen = vi.fn();
    testRender(
      <TrialCancelSheet
        deploymentRequestId="test-id"
        isCancellationDefinitive={false}
        open
        setOpen={setOpen}
        platformIdentifier={PlatformIdentifierEnum.OPENCTI}
      />,
      { relayConfig: environment }
    );
    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: /submit/i }));
    });
    await waitFor(() => {
      expect(setOpen).toHaveBeenCalledWith(false);
    });
    expect(lastCancelDeploymentRequestVariables).toMatchObject({
      cancellationReason: 'Test reason',
    });
  });

  it('should show warning if cancellation is definitive', () => {
    testRender(
      <TrialCancelSheet
        deploymentRequestId="id"
        isCancellationDefinitive
        open
        setOpen={vi.fn()}
        platformIdentifier={PlatformIdentifierEnum.OPENCTI}
      />,
      { relayConfig: createMockEnvironment() }
    );
    expect(
      screen.getByText(
        'Service.Trials.Cancellation.ConfirmationForm.NoNewTrialPossible'
      )
    ).toBeInTheDocument();
  });

  it('should call setOpen(false) when cancel button is clicked', () => {
    const setOpen = vi.fn();
    testRender(
      <TrialCancelSheet
        deploymentRequestId="id"
        isCancellationDefinitive={false}
        open
        setOpen={setOpen}
        platformIdentifier={PlatformIdentifierEnum.OPENCTI}
      />,
      { relayConfig: createMockEnvironment() }
    );
    fireEvent.click(screen.getByRole('button', { name: 'Utils.Cancel' }));
    expect(setOpen).toHaveBeenCalledWith(false);
  });

  it('should show error toast on mutation error', async () => {
    vi.doMock('react-relay', async (importOriginal) => ({
      ...(await importOriginal()),
      useMutation: () => [
        (opts: { onError?: (err: Error) => void }) => {
          opts.onError?.(new Error('Some error'));
        },
        {},
      ],
    }));
    await vi.resetModules();
    const uiMod = await import('@filigran/ui');
    const toast = uiMod.toast as ReturnType<typeof vi.fn>;
    toast.mockClear();
    const { TrialCancelSheet: ErrorTrialCancelSheet } =
      await import('./TrialCancelSheet');
    testRender(
      <ErrorTrialCancelSheet
        deploymentRequestId="id"
        isCancellationDefinitive={false}
        open
        setOpen={vi.fn()}
        platformIdentifier={PlatformIdentifierEnum.OPENCTI}
      />,
      { relayConfig: createMockEnvironment() }
    );
    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: /submit/i }));
    });
    await waitFor(() => {
      const errorCall = toast.mock.calls.find(
        (call: unknown[]) =>
          (call[0] as Record<string, unknown>)?.variant === 'destructive'
      );
      expect(errorCall?.[0]).toMatchObject({
        variant: 'destructive',
        title: 'Utils.Error',
        description: expect.stringContaining('Error.Server.Some error'),
      });
    });
  });
});
