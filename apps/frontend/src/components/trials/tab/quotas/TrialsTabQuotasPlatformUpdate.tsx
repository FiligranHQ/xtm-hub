import { TrialsTabQuotasPlatformUpdateForm } from '@/components/trials/tab/quotas/TrialsTabQuotasPlatformUpdateForm';
import { SheetWithPreventingDialog } from '@/components/ui/SheetWithPreventingDialog';
import { trialsDeploymentAvailabilityFragment$data } from '@generated/trialsDeploymentAvailabilityFragment.graphql';
import { useTranslate } from '@tolgee/react';
import { ReactNode, useState } from 'react';
interface TrialsTabQuotasPlatformUpdateProps {
  quota: trialsDeploymentAvailabilityFragment$data;
  trigger?: ReactNode;
  onCloseSheet?: () => void;
  defaultStateOpen?: boolean;
}

export const TrialsTabQuotasPlatformUpdate = ({
  trigger,
  onCloseSheet,
  defaultStateOpen,
  quota,
}: TrialsTabQuotasPlatformUpdateProps) => {
  const { t } = useTranslate();
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

  const translatedRegion = t(`Region_${quota.region.toUpperCase()}`);
  const translatedPlatform = t(
    `PlatformIdentifier_${quota.platform_identifier}`
  );

  return (
    <SheetWithPreventingDialog
      title={t('TrialsDashboard_UpdateQuotasForm_Title', {
        region: translatedRegion,
        platform: translatedPlatform,
      })}
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
