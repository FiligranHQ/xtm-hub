import { AlertDialogComponent } from '@/components/ui/alert-dialog';
import { useDialogContext } from '@/components/ui/sheet-with-preventing-dialog';
import { csvFeedsItem_fragment$data } from '@generated/csvFeedsItem_fragment.graphql';
import { Button } from 'filigran-ui';
import { useTranslations } from 'next-intl';

interface CsvFeedDeleteProps {
  userCanDelete?: boolean;
  onDelete?: () => void;
  csvFeed: csvFeedsItem_fragment$data;
}

export const CsvFeedDelete = ({
  userCanDelete,
  onDelete,
  csvFeed,
}: CsvFeedDeleteProps) => {
  const t = useTranslations();
  const { handleCloseSheet } = useDialogContext();

  return (
    userCanDelete && (
      <AlertDialogComponent
        actionButtonText={t('Utils.Delete')}
        variantName={'destructive'}
        AlertTitle={t('Service.CsvFeed.DeleteCsvFeed', {
          name: csvFeed.name!,
        })}
        triggerElement={
          <Button
            variant="outline-destructive"
            className=""
            aria-label={t('Service.CsvFeed.DeleteCsvFeed', {
              name: csvFeed.name!,
            })}>
            {t('Utils.Delete')}
          </Button>
        }
        onClickContinue={(e: React.MouseEvent<HTMLButtonElement>) => {
          onDelete?.();
          handleCloseSheet(e);
        }}>
        {t('Service.CsvFeed.SureDeleteCsvFeed', {
          name: csvFeed.name!,
        })}
      </AlertDialogComponent>
    )
  );
};
