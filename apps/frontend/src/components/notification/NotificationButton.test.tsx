import { PortalContext } from '@/components/me/AppPortalContext';
import testRender from '@/utils/test/test-render';
import { screen } from '@testing-library/react';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  NotificationButton,
  notificationPendingUserQueryFilters,
} from './NotificationButton';

const mocks = vi.hoisted(() => ({
  refetch: vi.fn(),
  useSubscription: vi.fn(),
  commitLocalUpdate: vi.fn(),
}));

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    onClick,
  }: {
    children: ReactNode;
    href: string;
    onClick?: () => void;
  }) => (
    <a
      href={href}
      onClick={onClick}>
      {children}
    </a>
  ),
}));

vi.mock('react-relay', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-relay')>()),
  useLazyLoadQuery: () => ({}),
  useRefetchableFragment: () => [
    {
      pendingUsers: {
        __id: 'pending-users-connection-id',
        totalCount: 2,
        edges: [
          {
            node: {
              id: 'pending-user-1',
              first_name: 'John',
              last_name: 'Doe',
              email: 'john.doe@test.io',
            },
          },
          {
            node: {
              id: 'pending-user-2',
              first_name: 'Jane',
              last_name: 'Doe',
              email: 'jane.doe@test.io',
            },
          },
        ],
      },
    },
    mocks.refetch,
  ],
  readInlineData: (_fragment: unknown, node: unknown) => node,
  useRelayEnvironment: () => ({}),
  commitLocalUpdate: (environment: unknown, updater: unknown) =>
    mocks.commitLocalUpdate(environment, updater),
  useSubscription: (config: unknown) => mocks.useSubscription(config),
}));

const renderNotificationButton = (selectedOrganizationId: string | null) =>
  testRender(
    <PortalContext.Provider
      value={{
        me: selectedOrganizationId
          ? ({
              selected_organization_id: selectedOrganizationId,
            } as { selected_organization_id: string })
          : null,
      }}>
      <NotificationButton />
    </PortalContext.Provider>
  );

describe('notificationPendingUserQueryFilters', () => {
  it('should return query filters when organization id is provided', () => {
    // Given
    const organizationId = 'organization-1';

    // When
    const variables = notificationPendingUserQueryFilters(organizationId);

    // Then
    expect(variables).toEqual({
      count: 20,
      orderMode: 'asc',
      orderBy: 'last_login',
      filters: [{ key: 'organization_id', value: ['organization-1'] }],
    });
  });
});

describe('NotificationButton', () => {
  beforeEach(() => {
    mocks.refetch.mockReset();
    mocks.useSubscription.mockReset();
    mocks.commitLocalUpdate.mockReset();
    vi.mocked(useTranslations).mockReturnValue(
      Object.assign((key: string) => key, {
        rich: (key: string, values: { name: string }) =>
          `${key}:${values.name}`,
      })
    );
  });

  it('should render nothing when selected organization is missing', () => {
    // Given / When
    renderNotificationButton(null);

    // Then
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('should decrement the connection total count when a deletion event is received', () => {
    // Given
    renderNotificationButton('organization-1');
    const subscriptionConfig = mocks.useSubscription.mock.calls[0][0] as {
      onNext: (payload: unknown) => void;
    };

    // When
    subscriptionConfig.onNext({
      UserPending: {
        delete: {
          id: 'pending-user-1',
        },
      },
    });

    // Then
    expect(mocks.commitLocalUpdate).toHaveBeenCalledOnce();
    const updater = mocks.commitLocalUpdate.mock.calls[0][1] as (
      store: unknown
    ) => void;
    const connection = {
      getValue: vi.fn().mockReturnValue(2),
      setValue: vi.fn(),
    };

    updater({ get: vi.fn().mockReturnValue(connection) });

    expect(connection.setValue).toHaveBeenCalledWith(1, 'totalCount');
  });

  it('should refetch pending users when an invalidation event is received', () => {
    // Given
    renderNotificationButton('organization-1');
    const subscriptionConfig = mocks.useSubscription.mock.calls[0][0] as {
      onNext: (payload: unknown) => void;
    };

    // When
    subscriptionConfig.onNext({
      UserPending: {
        invalidate: {
          id: 'organization-1',
        },
      },
    });

    // Then
    expect(mocks.refetch).toHaveBeenCalledExactlyOnceWith(
      {},
      { fetchPolicy: 'network-only' }
    );
  });

  it('should list every pending user with a link to the pending users tab', async () => {
    // Given
    const { user } = renderNotificationButton('organization-1');

    // When
    await user.click(screen.getByRole('button'));

    // Then
    expect(
      screen.getByText('Notifications.UserNotification.Text:John Doe')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Notifications.UserNotification.Text:Jane Doe')
    ).toBeInTheDocument();
    expect(screen.getAllByRole('link')).toHaveLength(2);
  });
});
