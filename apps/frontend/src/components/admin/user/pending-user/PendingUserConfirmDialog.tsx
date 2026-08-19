import {
  PendingUserAction,
  PendingUserDialogState,
} from '@/components/admin/user/pending-user/pending-user-list.types';
import { AlertDialogComponent } from '@/components/ui/AlertDialog';
import { CheckIcon, CloseIcon } from '@filigran/icon';
import { useTranslations } from 'next-intl';
import { ReactElement } from 'react';

interface PendingUserConfirmDialogProps {
  pendingUserDialog: PendingUserDialogState | null;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: () => void;
}

const CONFIRM_MODAL_CONFIG: Record<
  PendingUserAction,
  {
    buttonVariant: 'default' | 'destructive';
    icon: ReactElement;
    i18nKey: string;
  }
> = {
  approve: {
    buttonVariant: 'default',
    icon: <CheckIcon className="h-4 w-4" />,
    i18nKey: 'PendingUserListPage.WarningUserAccept',
  },
  deny: {
    buttonVariant: 'destructive',
    icon: <CloseIcon className="h-4 w-4" />,
    i18nKey: 'PendingUserListPage.WarningUserRejection',
  },
};

export const PendingUserConfirmDialog = ({
  pendingUserDialog,
  onOpenChange,
  onConfirm,
}: PendingUserConfirmDialogProps) => {
  const t = useTranslations();
  if (!pendingUserDialog) {
    return null;
  }

  const {
    buttonVariant: confirmModalButtonVariant,
    icon: confirmModalIcon,
    i18nKey: confirmModalI18nKey,
  } = CONFIRM_MODAL_CONFIG[pendingUserDialog.action];

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
