'use client';
import GuardCapacityComponent from '@/components/admin-guard';
import { SheetWithPreventingDialog } from '@/components/ui/sheet-with-preventing-dialog';
import TriggerButton from '@/components/ui/trigger-button';
import { RESTRICTION } from '@/utils/constant';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { z } from 'zod';
import {
  CustomDashboardForm,
  newDocumentSchema,
} from './custom-dashboard-form';

interface CustomDashboardSheetProps {
  connectionId: string;
  serviceInstanceId: string;
}

export const CustomDashboardSheet = ({
  connectionId,
  serviceInstanceId,
}: CustomDashboardSheetProps) => {
  const t = useTranslations();
  const [openSheet, setOpenSheet] = useState(false);

  const handleSubmit = (values: z.infer<typeof newDocumentSchema>) => {
    /*vaultDocumentMutation({
      variables: {
        ...values,
        serviceInstanceId,
        connections: [connectionId],
      },
      uploadables: values.document as unknown as UploadableMap,
      onCompleted: (response) => {
        setOpenSheet(false);
        toast({
          title: t('Utils.Success'),
          description: t('VaultActions.DocumentAdded', {
            file_name: response.addDocument.file_name,
          }),
        });
      },
      onError: (error) => {
        toast({
          variant: 'destructive',
          title: t('Utils.Error'),
          description: t(`Error.Server.${error.message}`),
        });
      },
      });*/
  };

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
          <CustomDashboardForm
            serviceInstanceId={serviceInstanceId}
            handleSubmit={handleSubmit}
          />
        </SheetWithPreventingDialog>
      </GuardCapacityComponent>
    </>
  );
};
