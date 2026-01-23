import { AlertDialogComponent } from '@/components/ui/alert-dialog';
import { IconActionsItem } from '@/components/ui/icon-actions';
import { useTranslations } from 'next-intl';

interface ServiceDeleteProps {
  userCanDelete?: boolean;
  onDelete?: () => void;
  serviceName: string;
  translationKey: string;
}

export const ServiceDelete = ({
  userCanDelete,
  onDelete,
  serviceName,
  translationKey,
}: ServiceDeleteProps) => {
  const t = useTranslations();

  return (
    userCanDelete && (
      <AlertDialogComponent
        actionButtonText={t('Utils.Delete')}
        variantName={'destructive'}
        AlertTitle={t(`${translationKey}.DeleteService`, {
          name: serviceName,
        })}
        triggerElement={
          <IconActionsItem
            onSelect={(e) => {
              e.preventDefault();
            }}>
            {t('Utils.Delete')}
          </IconActionsItem>
        }
        onClickContinue={() => {
          onDelete?.();
        }}>
        {t(`${translationKey}.SureDeleteService`, {
          name: serviceName,
        })}
      </AlertDialogComponent>
    )
  );
};
