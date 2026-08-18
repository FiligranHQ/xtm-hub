import {
  PendingUserAction,
  PendingUserDialogState,
} from '@/components/admin/user/pending-user/pending-user-list.types';
import { UserList_fragment$data } from '@generated/UserList_fragment.graphql';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

const PENDING_USER_ACTION_PARAM = 'action';
const PENDING_USER_ID_PARAM = 'user_id';

const parsePendingUserAction = (
  action: string | null
): PendingUserAction | null =>
  action === 'approve' || action === 'deny' ? action : null;

interface UsePendingUserDialogParams {
  userData: UserList_fragment$data[];
  approveUser: (user: UserList_fragment$data) => void;
  rejectUser: (user: UserList_fragment$data) => void;
}

export const usePendingUserDialog = ({
  userData,
  approveUser,
  rejectUser,
}: UsePendingUserDialogParams) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const [pendingUserDialog, setPendingUserDialog] =
    useState<PendingUserDialogState | null>(() => {
      const action = parsePendingUserAction(
        searchParams.get(PENDING_USER_ACTION_PARAM)
      );
      const userId = searchParams.get(PENDING_USER_ID_PARAM);
      if (!action || !userId) {
        return null;
      }

      const user = userData.find(({ id }) => id === userId);
      return user ? { action, user } : null;
    });

  const openPendingUserDialog = useCallback(
    (action: PendingUserAction, user: UserList_fragment$data) => {
      setPendingUserDialog({ action, user });
    },
    []
  );

  const openApproveDialog = useCallback(
    (user: UserList_fragment$data) => {
      openPendingUserDialog('approve', user);
    },
    [openPendingUserDialog]
  );

  const openRejectDialog = useCallback(
    (user: UserList_fragment$data) => {
      openPendingUserDialog('deny', user);
    },
    [openPendingUserDialog]
  );

  const closePendingUserDialog = useCallback((isOpen: boolean) => {
    if (!isOpen) {
      setPendingUserDialog(null);
    }
  }, []);

  const onConfirmPendingUserAction = useCallback(() => {
    if (!pendingUserDialog) {
      return;
    }

    if (pendingUserDialog.action === 'approve') {
      approveUser(pendingUserDialog.user);
      return;
    }

    rejectUser(pendingUserDialog.user);
  }, [approveUser, pendingUserDialog, rejectUser]);

  useEffect(() => {
    if (
      !searchParams.has(PENDING_USER_ACTION_PARAM) &&
      !searchParams.has(PENDING_USER_ID_PARAM)
    ) {
      return;
    }

    const nextSearchParams = new URLSearchParams(searchParams.toString());
    nextSearchParams.delete(PENDING_USER_ACTION_PARAM);
    nextSearchParams.delete(PENDING_USER_ID_PARAM);
    const nextSearch = nextSearchParams.toString();
    router.replace(nextSearch ? `${pathname}?${nextSearch}` : pathname);
  }, [pathname, router, searchParams]);

  return {
    pendingUserDialog,
    openApproveDialog,
    openRejectDialog,
    closePendingUserDialog,
    onConfirmPendingUserAction,
  };
};
