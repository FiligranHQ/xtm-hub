import testRender from '@/utils/test/test-render';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { createMockEnvironment } from 'relay-test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TrialCancelSheet } from './TrialCancelSheet';

const testState = vi.hoisted(() => ({
  lastCancelDeploymentRequestVariables: null as Record<string, unknown> | null,
  mutationMode: 'success' as 'success' | 'error',
  toastMock: vi.fn(),
}));

vi.mock('@/components/service/trial-instances/useOrgaFreeTrials', () => ({
  useOrgaFreeTrial: () => ({ refetch: vi.fn() }),
}));
vi.mock('@/components/ui/SheetWithPreventingDialog', () => ({
  SheetWithPreventingDialog: ({
    children,
    title,
  }: {
    children: React.ReactNode;
    title: string;
  }) => (
    <div>
      <h2>{title}</h2>
      {children}
    </div>
  ),
}));
vi.mock('@/components/service/registration/SelectWithEditableField', () => ({
  SelectWithEditableField: () => (
    <div data-testid="select-with-editable-field" />
  ),
}));
vi.mock('react-relay', async (importOriginal) => ({
  ...(await importOriginal()),
  useMutation: () => [
    (opts: {
      variables: Record<string, unknown>;
      onCompleted?: (data: unknown) => void;
      onError?: (err: Error) => void;
    }) => {
      testState.lastCancelDeploymentRequestVariables = opts.variables;
      if (testState.mutationMode === 'error') {
        opts.onError?.(new Error('Some error'));
        return;
      }
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
vi.mock('@filigran/ui', () => {
  return {
    toast: testState.toastMock,
    Button: ({
      children,
      ...props
    }: {
      children: React.ReactNode;
      [key: string]: unknown;
    }) => <button {...props}>{children}</button>,
    FormItem: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    FormLabel: ({ children }: { children: React.ReactNode }) => (
      <label>{children}</label>
    ),
    FormMessage: ({ children }: { children?: React.ReactNode }) =>
      children ? <div>{children}</div> : null,
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
    testState.lastCancelDeploymentRequestVariables = null;
    testState.mutationMode = 'success';
    testState.toastMock.mockReset();
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
    expect(testState.lastCancelDeploymentRequestVariables).toMatchObject({
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
    testState.mutationMode = 'error';
    testRender(
      <TrialCancelSheet
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
      const errorCall = testState.toastMock.mock.calls.find(
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
