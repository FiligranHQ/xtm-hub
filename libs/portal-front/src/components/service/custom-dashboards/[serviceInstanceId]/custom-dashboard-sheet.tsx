'use client';
import { ServiceCapabilityName } from '@/components/service/[slug]/capabilities/capability.helper';
import { SheetWithPreventingDialog } from '@/components/ui/sheet-with-preventing-dialog';
import useServiceCapability from '@/hooks/useServiceCapability';
import { omit } from '@/lib/omit';
import { fileListToUploadableMap } from '@/relay/environment/fetchFormData';
import revalidatePathActions from '@/utils/actions/revalidatePath.actions';
import { PUBLIC_CYBERSECURITY_SOLUTIONS_PATH } from '@/utils/path/constant';
import { customDashboardsCreateMutation } from '@generated/customDashboardsCreateMutation.graphql';
import { serviceByIdQuery$data } from '@generated/serviceByIdQuery.graphql';
import { Button, toast } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useMutation } from 'react-relay';
import { CustomDashboardsCreateMutation } from '../custom-dashboard.graphql';
import {
  CustomDashboardForm,
  CustomDashboardFormValues,
} from './custom-dashboard-form';

interface CustomDashboardSheetProps {
  connectionId: string;
  serviceInstance: NonNullable<serviceByIdQuery$data['serviceInstanceById']>;
}

export const CustomDashboardSheet = ({
  connectionId,
  serviceInstance,
}: CustomDashboardSheetProps) => {
  const t = useTranslations();
  const [openSheet, setOpenSheet] = useState(false);
  const [createCustomDashboards] = useMutation<customDashboardsCreateMutation>(
    CustomDashboardsCreateMutation
  );

  const handleSubmit = async (
    values: CustomDashboardFormValues,
    callback: () => void
  ) => {
    const input = omit(values, ['document', 'images', 'documentId']);
    const documents = [
      ...Array.from(values.document),
      ...Array.from(values.images),
    ];

    createCustomDashboards({
      variables: {
        input,
        serviceInstanceId: serviceInstance.id,
        connections: [connectionId],
        document: documents,
      },
      uploadables: fileListToUploadableMap(documents),
      onCompleted: (response) => {
        if (!response.createCustomDashboard) {
          toast({
            variant: 'destructive',
            title: t('Utils.Error'),
            description: t('Error.AnErrorOccured'),
          });
          return;
        }
        setOpenSheet(false);
        revalidatePathActions([PUBLIC_CYBERSECURITY_SOLUTIONS_PATH]);
        callback();
        toast({
          title: t('Utils.Success'),
          description: t('Service.CustomDashboards.Actions.Added', {
            name: values.name,
          }),
        });
      },
      onError: (error) => {
        toast({
          variant: 'destructive',
          title: t('Utils.Error'),
          description: t(`Error.Server.${(error as Error).message}`),
        });
      },
    });
  };

  const userCanUpdate = useServiceCapability(
    ServiceCapabilityName.Upload,
    serviceInstance
  );

  return (
    <>
      {userCanUpdate && (
        <SheetWithPreventingDialog
          open={openSheet}
          setOpen={setOpenSheet}
          trigger={
            <Button>{t('Service.CustomDashboards.AddDashboard')}</Button>
          }
          title={t('Service.CustomDashboards.AddDashboard')}>
          <CustomDashboardForm handleSubmit={handleSubmit} />
        </SheetWithPreventingDialog>
      )}
    </>
  );
};
