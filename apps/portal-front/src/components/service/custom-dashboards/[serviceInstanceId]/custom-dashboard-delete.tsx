import { AlertDialogComponent } from '@/components/ui/alert-dialog';
import { useDialogContext } from '@/components/ui/sheet-with-preventing-dialog';
import { customDashboardsItem_fragment$data } from '@generated/customDashboardsItem_fragment.graphql';
import { Button } from 'filigran-ui';
import { useTranslations } from 'next-intl';

interface CustomDashboardDeleteProps {
  userCanDelete?: boolean;
  onDelete?: () => void;
  customDashboard: customDashboardsItem_fragment$data;
}

export const CustomDashboardDelete = ({
  userCanDelete,
  onDelete,
  customDashboard,
}: CustomDashboardDeleteProps) => {
  const t = useTranslations();
  const { handleCloseSheet } = useDialogContext();

  return (
    userCanDelete && (
      <AlertDialogComponent
        actionButtonText={t('Utils.Delete')}
        variantName={'destructive'}
        AlertTitle={t('Service.CustomDashboards.DeleteDashboard', {
          name: customDashboard.name,
        })}
        triggerElement={
          <Button
            variant="outline-destructive"
            className=""
            aria-label={t('Service.CustomDashboards.DeleteDashboard', {
              name: customDashboard.name,
            })}>
            {t('Utils.Delete')}
          </Button>
        }
        onClickContinue={(e: React.MouseEvent<HTMLButtonElement>) => {
          onDelete?.();
          handleCloseSheet(e);
        }}>
        {t('Service.CustomDashboards.SureDeleteDashboard', {
          name: customDashboard.name,
        })}
      </AlertDialogComponent>
    )
  );
};
