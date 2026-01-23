import { AlertDialogComponent } from '@/components/ui/alert-dialog';
import { IconActionsItem } from '@/components/ui/icon-actions';
import { Button } from '@filigran/ui';
import { useTranslations } from 'next-intl';

interface ServiceDeleteProps {
  userCanDelete?: boolean;
  onDelete?: () => void;
  serviceName: string;
  translationKey: string;
  type?: 'menuitem' | 'button';
}

export const ServiceDelete = ({
  userCanDelete,
  onDelete,
  serviceName,
  translationKey,
  type = 'button',
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
          type === 'menuitem' ? (
            <IconActionsItem
              onSelect={(e) => {
                e.preventDefault();
              }}>
              {t('Utils.Delete')}
            </IconActionsItem>
          ) : (
            <Button variant={'outline-destructive'}>{t('Utils.Delete')}</Button>
          )
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
