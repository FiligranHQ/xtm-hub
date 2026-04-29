import testRender from '@/utils/test/test-render';
import { act, fireEvent, screen } from '@testing-library/react';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import { describe, expect, it } from 'vitest';
import { TrialsManageUsersDialog } from './TrialsManageUsersDialog';

describe('TrialsManageUsersDialog', () => {
  it('should render the trigger button and not trigger any GraphQL query on mount', () => {
    const environment = createMockEnvironment();
    testRender(
      <TrialsManageUsersDialog
        serviceInstanceId="service-123"
        organizationId="org-456"
      />,
      { relayConfig: environment }
    );
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(environment.mock.getAllOperations()).toHaveLength(0);
  });

  it('should trigger serviceGroupsByServiceInstanceIdQuery when dialog is opened', async () => {
    const environment = createMockEnvironment();
    testRender(
      <TrialsManageUsersDialog
        serviceInstanceId="service-123"
        organizationId="org-456"
      />,
      { relayConfig: environment }
    );

    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
    });

    await act(async () => {
      environment.mock.resolveMostRecentOperation((operation) =>
        MockPayloadGenerator.generate(operation)
      );
    });

    const operations = environment.mock.getAllOperations();
    const serviceGroupsOperation = operations.find(
      (op) =>
        op.request.node.params.name === 'serviceGroupsByServiceInstanceIdQuery'
    );
    expect(serviceGroupsOperation).toBeDefined();
  });
});
