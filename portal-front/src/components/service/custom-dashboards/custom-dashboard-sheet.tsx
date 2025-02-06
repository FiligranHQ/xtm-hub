'use client';
import GuardCapacityComponent from '@/components/admin-guard';
import { SheetWithPreventingDialog } from '@/components/ui/sheet-with-preventing-dialog';
import TriggerButton from '@/components/ui/trigger-button';
import { omit } from '@/lib/omit';
import { isNil } from '@/lib/utils';
import { fileListToUploadableMap } from '@/relay/environment/fetchFormData';
import { RESTRICTION } from '@/utils/constant';
import {
  documentAddMutation,
  documentAddMutation$data,
  documentAddMutation$variables,
} from '@generated/documentAddMutation.graphql';
import { toast } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useMutation } from 'react-relay';
import { DocumentAddMutation } from '../document/document.graphql';
import {
  CustomDashboardForm,
  CustomDashboardFormValues,
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
  const [addDocument] = useMutation<documentAddMutation>(DocumentAddMutation);

  const asyncAddDocument = async (
    values: Partial<CustomDashboardFormValues>,
    isParent: boolean
  ): Promise<documentAddMutation$data> =>
    new Promise((resolve, reject) => {
      if (isNil(values.document)) {
        return reject(new Error('Document is required'));
      }
      const variables: documentAddMutation$variables = {
        ...values,
        serviceInstanceId,
        connections: isParent ? [connectionId] : [], // Don't pass the connectionId to bypass update the list of documents with hidden documents
      };

      addDocument({
        variables,
        uploadables: fileListToUploadableMap(values.document),
        onCompleted: (response) => resolve(response),
        onError: (error) => reject(error),
      });
    });

  const handleSubmit = async (values: CustomDashboardFormValues) => {
    const images = values.images;
    const input = omit(values, ['images']);

    try {
      // Add parent document (the dashboard)
      const parentDocResult = await asyncAddDocument(input, true);

      // Add images
      for (const image of images) {
        if (isNil(image.file)) {
          continue;
        }
        await asyncAddDocument(
          {
            ...input,
            document: image.file,
            parentDocumentId: parentDocResult.addDocument.id,
          },
          false
        );
      }

      setOpenSheet(false);
      toast({
        title: t('Utils.Success'),
        description: t('Service.CustomDashboards.Actions.Added', {
          name: parentDocResult.addDocument.name,
        }),
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t('Utils.Error'),
        description: t(`Error.Server.${(error as Error).message}`),
      });
    }
  };

  return (
    <>
      <GuardCapacityComponent
        capacityRestriction={[RESTRICTION.CAPABILITY_BYPASS]}>
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
