import { UserList_fragment$data } from '@generated/UserList_fragment.graphql';
import { act, renderHook } from '@testing-library/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { usePendingUserDialog } from './use-pending-user-dialog';

const pendingUsers = [
  {
    id: 'user-1',
    email: 'pending.one@filigran.io',
    first_name: 'Pending',
    last_name: 'One',
  },
  {
    id: 'user-2',
    email: 'pending.two@filigran.io',
    first_name: 'Pending',
    last_name: 'Two',
  },
] as UserList_fragment$data[];

describe('usePendingUserDialog', () => {
  const replaceMock = vi.fn();
  const approveUserMock = vi.fn();
  const rejectUserMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usePathname).mockReturnValue('/admin/manage/user');
    vi.mocked(useRouter).mockReturnValue({
      replace: replaceMock,
    } as never);
  });

  it('opens the dialog from URL params and removes action/user_id from the URL', () => {
    vi.mocked(useSearchParams).mockReturnValue(
      new URLSearchParams('action=approve&user_id=user-1&foo=bar') as never
    );

    const { result } = renderHook(() =>
      usePendingUserDialog({
        userData: pendingUsers,
        approveUser: approveUserMock,
        rejectUser: rejectUserMock,
      })
    );

    expect(replaceMock).toHaveBeenCalledWith('/admin/manage/user?foo=bar');
    expect(result.current.pendingUserDialog).toEqual({
      action: 'approve',
      user: pendingUsers[0],
    });
  });

  it('keeps the dialog open when the effect re-runs with a new userData identity', () => {
    vi.mocked(useSearchParams).mockReturnValue(
      new URLSearchParams('action=approve&user_id=user-1') as never
    );

    const { result, rerender } = renderHook(
      ({ userData }: { userData: UserList_fragment$data[] }) =>
        usePendingUserDialog({
          userData,
          approveUser: approveUserMock,
          rejectUser: rejectUserMock,
        }),
      { initialProps: { userData: [...pendingUsers] } }
    );

    rerender({ userData: [...pendingUsers] });

    expect(result.current.pendingUserDialog).toEqual({
      action: 'approve',
      user: pendingUsers[0],
    });
    expect(replaceMock).toHaveBeenCalledOnce();
  });

  it('does not open a dialog for unknown user but still cleans URL params', () => {
    vi.mocked(useSearchParams).mockReturnValue(
      new URLSearchParams('action=deny&user_id=missing-user') as never
    );

    const { result } = renderHook(() =>
      usePendingUserDialog({
        userData: pendingUsers,
        approveUser: approveUserMock,
        rejectUser: rejectUserMock,
      })
    );

    expect(result.current.pendingUserDialog).toBeNull();
    expect(replaceMock).toHaveBeenCalledWith('/admin/manage/user');
  });

  it('dispatches approve/reject callbacks when confirmed and closes on demand', () => {
    vi.mocked(useSearchParams).mockReturnValue(
      new URLSearchParams('') as never
    );

    const { result } = renderHook(() =>
      usePendingUserDialog({
        userData: pendingUsers,
        approveUser: approveUserMock,
        rejectUser: rejectUserMock,
      })
    );

    act(() => {
      result.current.openApproveDialog(pendingUsers[0]);
    });
    act(() => {
      result.current.onConfirmPendingUserAction();
    });

    expect(approveUserMock).toHaveBeenCalledWith(pendingUsers[0]);
    expect(rejectUserMock).not.toHaveBeenCalled();

    act(() => {
      result.current.openRejectDialog(pendingUsers[1]);
    });
    act(() => {
      result.current.onConfirmPendingUserAction();
    });

    expect(rejectUserMock).toHaveBeenCalledWith(pendingUsers[1]);

    act(() => {
      result.current.closePendingUserDialog(true);
    });
    expect(result.current.pendingUserDialog).not.toBeNull();

    act(() => {
      result.current.closePendingUserDialog(false);
    });
    expect(result.current.pendingUserDialog).toBeNull();
  });

  it('consumes the URL action once even when the user is not in the list', () => {
    vi.mocked(useSearchParams).mockReturnValue(
      new URLSearchParams('action=approve&user_id=unknown-user') as never
    );

    const { result, rerender } = renderHook(
      ({ userData }: { userData: UserList_fragment$data[] }) =>
        usePendingUserDialog({
          userData,
          approveUser: approveUserMock,
          rejectUser: rejectUserMock,
        }),
      {
        initialProps: {
          userData: pendingUsers,
        },
      }
    );

    expect(replaceMock).toHaveBeenCalledExactlyOnceWith('/admin/manage/user');
    expect(result.current.pendingUserDialog).toBeNull();

    rerender({
      userData: pendingUsers,
    });

    expect(replaceMock).toHaveBeenCalledOnce();
  });

  it('should consume unsupported URL action once and ignore further rerenders', () => {
    vi.mocked(useSearchParams).mockReturnValue(
      new URLSearchParams(
        'action=archive&user_id=user-1&foo=bar'
      ) as unknown as ReturnType<typeof useSearchParams>
    );

    const { rerender } = renderHook(() =>
      usePendingUserDialog({
        userData: pendingUsers,
        approveUser: approveUserMock,
        rejectUser: rejectUserMock,
      })
    );

    expect(replaceMock).toHaveBeenCalledWith('/admin/manage/user?foo=bar');

    rerender();

    expect(replaceMock).toHaveBeenCalledTimes(1);
  });

  it('should not call approve or reject when no dialog action was selected', () => {
    vi.mocked(useSearchParams).mockReturnValue(
      new URLSearchParams('') as unknown as ReturnType<typeof useSearchParams>
    );

    const { result } = renderHook(() =>
      usePendingUserDialog({
        userData: pendingUsers,
        approveUser: approveUserMock,
        rejectUser: rejectUserMock,
      })
    );

    act(() => {
      result.current.onConfirmPendingUserAction();
    });

    expect(approveUserMock).not.toHaveBeenCalled();
    expect(rejectUserMock).not.toHaveBeenCalled();
  });
});
