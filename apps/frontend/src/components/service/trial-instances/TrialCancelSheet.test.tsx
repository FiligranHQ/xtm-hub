import testRender from '@/utils/test/test-render';
import * as FiligranUI from '@filigran/ui';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { createMockEnvironment } from 'relay-test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TrialCancelSheet } from './TrialCancelSheet';

const testState = vi.hoisted(() => ({
  lastCancelDeploymentRequestVariables: null as Record<string, unknown> | null,
  mutationMode: 'success' as 'success' | 'error',
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
describe('TrialCancelSheet', () => {
  beforeEach(() => {
    testState.lastCancelDeploymentRequestVariables = null;
    testState.mutationMode = 'success';
    vi.spyOn(FiligranUI, 'toast').mockImplementation(() => undefined);
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
    fireEvent.click(screen.getByRole('button', { name: 'Utils.Continue' }));

    await waitFor(() => {
      expect(setOpen).toHaveBeenCalledWith(false);
    });
    expect(testState.lastCancelDeploymentRequestVariables).toEqual({
      deploymentRequestId: 'test-id',
      cancellationReason: undefined,
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
    fireEvent.click(screen.getByRole('button', { name: 'Utils.Continue' }));

    await waitFor(() => {
      expect(FiligranUI.toast).toHaveBeenCalledWith({
        variant: 'destructive',
        title: 'Utils.Error',
        description: 'Error.Server.Some error',
      });
    });
  });
});
