'use client';
import GuardCapacityComponent from '@/components/admin-guard';
import { ServiceCapabilityName } from '@/components/service/[slug]/capabilities/capability.helper';
import { SheetWithPreventingDialog } from '@/components/ui/sheet-with-preventing-dialog';
import TriggerButton from '@/components/ui/trigger-button';
import { omit } from '@/lib/omit';
import { isNil } from '@/lib/utils';
import { fileListToUploadableMap } from '@/relay/environment/fetchFormData';
import { RESTRICTION } from '@/utils/constant';
import { customDashboardSheet_update_childs$key } from '@generated/customDashboardSheet_update_childs.graphql';
import {
  documentAddMutation,
  documentAddMutation$data,
  documentAddMutation$variables,
} from '@generated/documentAddMutation.graphql';
import { serviceByIdQuery$data } from '@generated/serviceByIdQuery.graphql';
import { toast } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { graphql, useMutation } from 'react-relay';
import { DocumentAddMutation } from '../document/document.graphql';
import {
  CustomDashboardForm,
  CustomDashboardFormValues,
} from './custom-dashboard-form';

interface CustomDashboardSheetProps {
  connectionId: string;
  serviceInstanceId: string;

  serviceInstance: NonNullable<serviceByIdQuery$data['serviceInstanceById']>;
}

export const CustomDashboardSheet = ({
  connectionId,
  serviceInstanceId,
  serviceInstance,
}: CustomDashboardSheetProps) => {
  const t = useTranslations();
  const [openSheet, setOpenSheet] = useState(false);
  const [addDocument] = useMutation<documentAddMutation>(DocumentAddMutation);

  const asyncAddDocument = async (
    values: Partial<CustomDashboardFormValues>,
    parent?: documentAddMutation$data['addDocument']
  ): Promise<documentAddMutation$data> =>
    new Promise((resolve, reject) => {
      if (isNil(values.document)) {
        return reject(new Error('Document is required'));
      }
      const variables: documentAddMutation$variables = {
        ...(values as Partial<documentAddMutation$variables>),
        serviceInstanceId,
        connections: !parent ? [connectionId] : [], // Don't pass the connectionId to bypass update the list of documents with hidden documents
      };

      addDocument({
        variables,
        uploadables: fileListToUploadableMap(values.document),
        onCompleted: (response) => resolve(response),
        onError: (error) => reject(error),
        updater: (store, response) => {
          if (parent) {
            const { updatableData } =
              store.readUpdatableFragment<customDashboardSheet_update_childs$key>(
                graphql`
                  fragment customDashboardSheet_update_childs on Document
                  @updatable {
                    children_documents {
                      __id
                      id
                    }
                  }
                `,
                parent
              );
            const newItems = [
              ...(updatableData.children_documents ?? []),
              { id: response?.addDocument.id, __id: response?.addDocument.id },
            ];
            updatableData.children_documents = newItems as [];
          }
        },
      });
    });

  const handleSubmit = async (
    values: CustomDashboardFormValues,
    callback: () => void
  ) => {
    const images = values.images;
    const input = omit(values, ['images']);

    try {
      // Add parent document (the dashboard)
      const parentDocResult = await asyncAddDocument(input);

      // Add images
      for (let i = 0; i < images.length; i++) {
        const image = images.item(i);
        if (isNil(image)) {
          continue;
        }
        await asyncAddDocument(
          {
            ...input,
            document: [image] as unknown as FileList,
            parentDocumentId: parentDocResult.addDocument.id,
          },
          parentDocResult.addDocument
        );
      }

      setOpenSheet(false);
      callback();
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
          <CustomDashboardForm handleSubmit={handleSubmit} />
        </SheetWithPreventingDialog>
      </GuardCapacityComponent>
      {serviceInstance?.capabilities.some(
        (capa) => capa?.toUpperCase() === ServiceCapabilityName.Upload
      ) && (
        <SheetWithPreventingDialog
          open={openSheet}
          setOpen={setOpenSheet}
          trigger={
            <TriggerButton label={t('Service.CustomDashboards.AddDashboard')} />
          }
          title={t('Service.CustomDashboards.AddDashboard')}>
          <CustomDashboardForm handleSubmit={handleSubmit} />
        </SheetWithPreventingDialog>
      )}
    </>
  );
};
