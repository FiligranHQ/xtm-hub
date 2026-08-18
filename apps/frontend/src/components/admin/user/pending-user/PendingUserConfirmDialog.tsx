import { PendingUserDialogState } from '@/components/admin/user/pending-user/pending-user-list.types';
import { AlertDialogComponent } from '@/components/ui/AlertDialog';
import { CheckIcon, CloseIcon } from '@filigran/icon';
import { useTranslations } from 'next-intl';

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

  const confirmModalI18nKey =
    pendingUserDialog.action === 'approve'
      ? 'PendingUserListPage.WarningUserAccept'
      : 'PendingUserListPage.WarningUserRejection';

  const confirmModalButtonVariant =
    pendingUserDialog.action === 'approve' ? 'default' : 'destructive';

  const confirmModalIcon =
    pendingUserDialog.action === 'approve' ? (
      <CheckIcon className="h-4 w-4" />
    ) : (
      <CloseIcon className="h-4 w-4" />
    );

  return (
    <AlertDialogComponent
      isOpen={!!pendingUserDialog}
      onOpenChange={onOpenChange}
      AlertTitle={t(`${confirmModalI18nKey}.Title`)}
      actionButtonText={t(`${confirmModalI18nKey}.Confirm`)}
      variantName={confirmModalButtonVariant}
      onClickContinue={onConfirm}>
      <div className="flex items-center gap-2">
        {confirmModalIcon}
        <span>
          {t(`${confirmModalI18nKey}.Description`, {
            email: pendingUserDialog.user.email,
          })}
        </span>
      </div>
    </AlertDialogComponent>
  );
};
