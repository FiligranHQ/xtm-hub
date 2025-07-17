import { AlertDialogComponent } from '@/components/ui/alert-dialog';
import { useDialogContext } from '@/components/ui/sheet-with-preventing-dialog';
import { obasScenariosItem_fragment$data } from '@generated/obasScenariosItem_fragment.graphql';
import { Button } from 'filigran-ui';
import { useTranslations } from 'next-intl';

interface ObasScenarioDeleteProps {
  userCanDelete?: boolean;
  onDelete?: () => void;
  obasScenario: obasScenariosItem_fragment$data;
}

export const ObasScenarioDelete = ({
  userCanDelete,
  onDelete,
  obasScenario,
}: ObasScenarioDeleteProps) => {
  const t = useTranslations();
  const { handleCloseSheet } = useDialogContext();

  return (
    userCanDelete && (
      <AlertDialogComponent
        actionButtonText={t('Utils.Delete')}
        variantName={'destructive'}
        AlertTitle={t('Service.ObasScenario.DeleteObasScenario', {
          name: obasScenario.name,
        })}
        triggerElement={
          <Button
            variant="outline-destructive"
            className=""
            aria-label={t('Service.ObasScenario.DeleteObasScenario', {
              name: obasScenario.name,
            })}>
            {t('Utils.Delete')}
          </Button>
        }
        onClickContinue={(e: React.MouseEvent<HTMLButtonElement>) => {
          onDelete?.();
          handleCloseSheet(e);
        }}>
        {t('Service.ObasScenario.SureDeleteObasScenario', {
          name: obasScenario.name,
        })}
      </AlertDialogComponent>
    )
  );
};
