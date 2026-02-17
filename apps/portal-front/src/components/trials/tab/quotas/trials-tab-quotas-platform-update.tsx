import { TrialsTabQuotasPlatformUpdateForm } from '@/components/trials/tab/quotas/trials-tab-quotas-platform-update-form';
import { SheetWithPreventingDialog } from '@/components/ui/sheet-with-preventing-dialog';
import { trialsDeploymentAvailabilityFragment$data } from '@generated/trialsDeploymentAvailabilityFragment.graphql';
import { useTranslations } from 'next-intl';
import React, { ReactNode, useState } from 'react';

interface Props {
  quota: trialsDeploymentAvailabilityFragment$data;
  trigger?: ReactNode;
  onCloseSheet?: () => void;
  defaultStateOpen?: boolean;
}

export const TrialsTabQuotasPlatformUpdate: React.FC<Props> = ({
  trigger,
  onCloseSheet,
  defaultStateOpen,
  quota,
}) => {
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

  const translatedRegion = t(`Region.${quota.region.toUpperCase()}`);
  const translatedPlatform = t(
    `PlatformIdentifier.${quota.platform_identifier}`
  );

  return (
    <SheetWithPreventingDialog
      title={t('TrialsDashboard.UpdateQuotasForm.Title', {
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
