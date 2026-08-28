import { TrialsTabQuotasPlatformUpdateForm } from '@/components/trials/tab/quotas/TrialsTabQuotasPlatformUpdateForm';
import { TrialsScope, trialsRegionKey } from '@/components/trials/trials.const';
import { SheetWithPreventingDialog } from '@/components/ui/SheetWithPreventingDialog';
import { TrialsQuotaFragment } from '@graphql/generated';
import { useTranslations } from 'next-intl';
import { ReactNode, useState } from 'react';

interface TrialsTabQuotasPlatformUpdateProps {
  quota: TrialsQuotaFragment;
  scope: TrialsScope;
  trigger?: ReactNode;
  onCloseSheet?: () => void;
  defaultStateOpen?: boolean;
}

export const TrialsTabQuotasPlatformUpdate = ({
  trigger,
  onCloseSheet,
  defaultStateOpen,
  quota,
  scope,
}: TrialsTabQuotasPlatformUpdateProps) => {
  const t = useTranslations();
  const [openSheet, setOpenSheet] = useState(defaultStateOpen ?? false);
  const handleOpenSheet = (open: boolean) => {
    setOpenSheet((prevState) => {
      const sheetIsClosing = prevState !== open && !open;
      if (sheetIsClosing && onCloseSheet) {
        onCloseSheet();
      }
      return open;
    });
  };

  const translatedRegion = t(trialsRegionKey(quota.region));

  return (
    <SheetWithPreventingDialog
      title={
        scope.kind === 'bundle'
          ? t('ManageTrials.Quotas.UpdateTitle', { region: translatedRegion })
          : t('TrialsDashboard.UpdateQuotasForm.Title', {
              region: translatedRegion,
              platform: t(`PlatformIdentifier.${scope.platformIdentifier}`),
            })
      }
      open={openSheet}
      setOpen={handleOpenSheet}
      trigger={trigger}>
      <TrialsTabQuotasPlatformUpdateForm
        quota={quota}
        callback={() => handleOpenSheet(false)}
      />
    </SheetWithPreventingDialog>
  );
};
