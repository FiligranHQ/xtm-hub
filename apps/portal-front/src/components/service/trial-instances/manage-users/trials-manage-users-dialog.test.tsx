import testRender from '@/utils/test/test-render';
import { act, fireEvent, screen } from '@testing-library/react';
import { createMockEnvironment } from 'relay-test-utils';
import { describe, expect, it } from 'vitest';
import { TrialsManageUsersDialog } from './trials-manage-users-dialog';

describe('TrialsManageUsersDialog', () => {
  it('should not trigger any GraphQL query on mount', () => {
    const environment = createMockEnvironment();
    testRender(
      <TrialsManageUsersDialog
        serviceInstanceId="service-123"
        organizationId="org-456"
      />,
      { relayConfig: environment }
    );
    expect(environment.mock.getAllOperations()).toHaveLength(0);
  });

  it('should trigger GraphQL queries only when dialog is opened', async () => {
    const environment = createMockEnvironment();
    testRender(
      <TrialsManageUsersDialog
        serviceInstanceId="service-123"
        organizationId="org-456"
      />,
      { relayConfig: environment }
    );

    expect(environment.mock.getAllOperations()).toHaveLength(0);

    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
    });

    expect(environment.mock.getAllOperations().length).toBeGreaterThan(0);
  });
});
