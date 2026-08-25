import { PendingUserDialogState } from '@/components/admin/user/pending-user/pending-user-list.types';
import { AlertDialogComponent } from '@/components/ui/AlertDialog';
import { useTranslations } from 'next-intl';
import { ReactNode } from 'react';

const renderStrong = (chunks: ReactNode) => <strong>{chunks}</strong>;

interface PendingUserConfirmDialogProps {
  pendingUserDialog: PendingUserDialogState | null;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: () => void;
}

export const PendingUserConfirmDialog = ({
  pendingUserDialog,
  onOpenChange,
  onConfirm,
}: PendingUserConfirmDialogProps) => {
  const t = useTranslations();
  if (!pendingUserDialog) {
    return null;
  }

  const i18nKey =
    pendingUserDialog.action === 'approve'
      ? 'PendingUserListPage.WarningUserAccept'
      : 'PendingUserListPage.WarningUserRejection';

  return (
    <AlertDialogComponent
      isOpen={!!pendingUserDialog}
      onOpenChange={onOpenChange}
      AlertTitle={t(`${i18nKey}.Title`)}
      actionButtonText={t(`${i18nKey}.Confirm`)}
      onClickContinue={onConfirm}>
      <div className="flex items-center gap-2">
        <span>
          {t.rich(`${i18nKey}.Description`, {
            email: pendingUserDialog.user.email,
            strong: renderStrong,
          })}
        </span>
      </div>
    </AlertDialogComponent>
  );
};
