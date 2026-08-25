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

interface ResolvedPendingUserDialogState {
  dialog: PendingUserDialogState | null;
  alreadyProcessed: boolean;
}

const resolvePendingUserDialogState = (
  searchParams: URLSearchParams,
  userData: UserList_fragment$data[]
): ResolvedPendingUserDialogState => {
  const action = parsePendingUserAction(
    searchParams.get(PENDING_USER_ACTION_PARAM)
  );
  const userId = searchParams.get(PENDING_USER_ID_PARAM);
  if (!action || !userId) {
    return { dialog: null, alreadyProcessed: false };
  }

  const user = userData.find(({ id }) => id === userId);
  if (user) {
    return { dialog: { action, user }, alreadyProcessed: false };
  }

  return { dialog: null, alreadyProcessed: true };
};

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
    useState<PendingUserDialogState | null>(
      () => resolvePendingUserDialogState(searchParams, userData).dialog
    );

  const [alreadyProcessedDialogOpen, setAlreadyProcessedDialogOpen] =
    useState<boolean>(
      () =>
        resolvePendingUserDialogState(searchParams, userData).alreadyProcessed
    );

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

  const closeAlreadyProcessedDialog = useCallback((isOpen: boolean) => {
    if (!isOpen) {
      setAlreadyProcessedDialogOpen(false);
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
    alreadyProcessedDialogOpen,
    closeAlreadyProcessedDialog,
  };
};
