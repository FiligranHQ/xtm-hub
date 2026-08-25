import { AlertDialogComponent } from '@/components/ui/AlertDialog';
import { useTranslations } from 'next-intl';

interface PendingUserAlreadyProcessedDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export const PendingUserAlreadyProcessedDialog = ({
  isOpen,
  onOpenChange,
}: PendingUserAlreadyProcessedDialogProps) => {
  const t = useTranslations();

  return (
    <AlertDialogComponent
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      displayCancelButton={false}
      AlertTitle={t('PendingUserListPage.AlreadyProcessed.Title')}
      actionButtonText={t('PendingUserListPage.AlreadyProcessed.Confirm')}
      onClickContinue={() => onOpenChange(false)}>
      <div className="flex items-center gap-2">
        <span>{t('PendingUserListPage.AlreadyProcessed.Description')}</span>
      </div>
    </AlertDialogComponent>
  );
};
