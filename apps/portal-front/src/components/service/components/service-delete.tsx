import { AlertDialogComponent } from '@/components/ui/alert-dialog';
import { useDialogContext } from '@/components/ui/sheet-with-preventing-dialog';
import { Button } from 'filigran-ui';
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
  const { handleCloseSheet } = useDialogContext();

  return (
    userCanDelete && (
      <AlertDialogComponent
        actionButtonText={t('Utils.Delete')}
        variantName={'destructive'}
        AlertTitle={t(`${translationKey}.DeleteService`, {
          name: serviceName,
        })}
        triggerElement={
          <Button
            variant="outline-destructive"
            className=""
            aria-label={t(`${translationKey}.DeleteService`, {
              name: serviceName,
            })}>
            {t('Utils.Delete')}
          </Button>
        }
        onClickContinue={(e: React.MouseEvent<HTMLButtonElement>) => {
          onDelete?.();
          handleCloseSheet(e);
        }}>
        {t(`${translationKey}.SureDeleteService`, {
          name: serviceName,
        })}
      </AlertDialogComponent>
    )
  );
};
