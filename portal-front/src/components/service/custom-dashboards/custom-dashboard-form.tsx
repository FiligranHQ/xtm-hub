'use client';
import GuardCapacityComponent from '@/components/admin-guard';
import { RESTRICTION } from '@/utils/constant';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { SheetWithPreventingDialog } from '@/components/ui/sheet-with-preventing-dialog';
import TriggerButton from '@/components/ui/trigger-button';
import useDecodedParams from '@/hooks/useDecodedParams';
interface CustomDashboardFormProps {
  connectionId: string;
}
export const CustomDashboardForm = ({
  connectionId,
}: CustomDashboardFormProps) => {
  const t = useTranslations();
  const [openSheet, setOpenSheet] = useState(false);

  const { slug } = useDecodedParams();

  return (
    <>
      <GuardCapacityComponent
        capacityRestriction={[RESTRICTION.CAPABILITY_BYPASS]}
        displayError={false}>
        <SheetWithPreventingDialog
          open={openSheet}
          setOpen={setOpenSheet}
          trigger={
            <TriggerButton label={t('Service.CustomDashboards.AddDashboard')} />
          }
          title={t('Service.CustomDashboards.AddDashboard')}>
          {slug} {connectionId}
        </SheetWithPreventingDialog>
      </GuardCapacityComponent>
    </>
  );
};
