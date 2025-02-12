'use client';
import GuardCapacityComponent from '@/components/admin-guard';
import CustomDashboardBento from '@/components/service/custom-dashboards/custom-dashboard-bento';
import { CustomDashboardUpdateForm, updateCustomDashboardSchema, } from '@/components/service/custom-dashboards/custom-dashboard-update-form';
import { DocumentDeleteMutation, documentItem, DocumentUpdateMutation, } from '@/components/service/document/document.graphql';
import DownloadDocument from '@/components/service/vault/download-document';
import { IconActions, IconActionsButton } from '@/components/ui/icon-actions';
import { SheetWithPreventingDialog } from '@/components/ui/sheet-with-preventing-dialog';
import { RESTRICTION } from '@/utils/constant';
import { customDashboardCard_update_childs$key } from '@generated/customDashboardCard_update_childs.graphql';
import { documentDeleteMutation } from '@generated/documentDeleteMutation.graphql';
import { documentItem_fragment$key } from '@generated/documentItem_fragment.graphql';
import { documentUpdateMutation } from '@generated/documentUpdateMutation.graphql';
import { serviceByIdQuery$data } from '@generated/serviceByIdQuery.graphql';
import { MoreVertIcon } from 'filigran-icon';
import { Badge, Carousel, toast } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { graphql, readInlineData, useMutation } from 'react-relay';
import { z } from 'zod';

interface CustomDashboardCardProps {
  data: documentItem_fragment$key;
  connectionId: string;
  serviceInstance: NonNullable<serviceByIdQuery$data['serviceInstanceById']>;
}

const CustomDashboardCard = ({
  data,
  connectionId,
  serviceInstance,
}: CustomDashboardCardProps) => {
  const customDashboard = readInlineData<documentItem_fragment$key>(
    documentItem,
    data
  );
  const t = useTranslations();
  const fileNames = (customDashboard.children_documents ?? [])?.map(
    ({ id }) => id
  );

  const [deleteDocument] = useMutation<documentDeleteMutation>(
    DocumentDeleteMutation
  );
  const [openSheet, setOpenSheet] = useState(false);

  const [updateDocumentMutation] = useMutation<documentUpdateMutation>(
    DocumentUpdateMutation
  );
  const updateDocument = (
    values: z.infer<typeof updateCustomDashboardSchema>
  ) => {
    updateDocumentMutation({
      variables: {
        documentId: customDashboard.id,
        serviceInstanceId: serviceInstance.id,
        input: {
          short_description: values.shortDescription,
          description: values.description,
          name: values.name,
          active: values.active,
        },
      },
      onCompleted: (response) => {
        setOpenSheet(false);
        toast({
          title: t('Utils.Success'),
          description: t('VaultActions.DocumentUpdated', {
            file_name: response.editDocument.name,
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
    });
  };

  return (
    <>
      <li className="border-light flex flex-col relative rounded border bg-page-background gap-l aria-disabled:opacity-60 h-[30rem]">
        <Carousel
          placeholder={
            <CustomDashboardBento
              customDashboard={customDashboard}
            />
          }
          slides={
            fileNames.length > 0
              ? fileNames.map(
                (fn) => `/document/visualize/${customDashboard.id}/${fn}`
              )
              : undefined
          }
        />
        <div className="flex items-center px-l justify-between">
          {/*TODO : will be filled when design is finalized*/}
          <div className="flex gap-s items-center">
            <Badge>Tags</Badge>
            <Badge variant="warning">Placeholder</Badge>
          </div>
          <GuardCapacityComponent
            capacityRestriction={[RESTRICTION.CAPABILITY_BYPASS]}>

            <IconActions
              icon={
                <>
                  <MoreVertIcon className="h-4 w-4 text-primary" />
                  <span className="sr-only">{t('Utils.OpenMenu')}</span>
                </>
              }>
              <DownloadDocument documentData={customDashboard} />
              <IconActionsButton
                className="normal-case"
                onClick={() => setOpenSheet(true)}
                aria-label={t('MenuActions.Update')}>
                {t('MenuActions.Update')}
              </IconActionsButton>
            </IconActions>
          </GuardCapacityComponent>
        </div>
        <h2
          className="flex-1 px-l max-h-[10rem] overflow-hidden"
          style={{ textOverflow: 'ellipsis' }}>
          {customDashboard.short_description}
        </h2>
        <p className="txt-mini p-l gap-1 items-center flex">
          <Badge
            size="sm"
            variant={customDashboard.active ? 'secondary' : 'warning'}>
            {t(customDashboard.active ? 'Badge.Published' : 'Badge.Draft')}
          </Badge>
        </p>
      </li>
      <SheetWithPreventingDialog
        open={openSheet}
        setOpen={setOpenSheet}
        title={t('Service.CustomDashboards.UpdateDashboard')}>
        <CustomDashboardUpdateForm
          customDashboard={customDashboard}
          serviceInstanceId={serviceInstance.id}
          handleSubmit={updateDocument}
          onDelete={(id) =>
            deleteDocument({
              variables: {
                documentId: id ?? customDashboard.id,
                serviceInstanceId: serviceInstance.id,
                connections: id ? [] : [connectionId],
                forceDelete: true,
              },
              updater: (store) => {
                if (id) {
                  const { updatableData } =
                    store.readUpdatableFragment<customDashboardCard_update_childs$key>(
                      graphql`
                        fragment customDashboardCard_update_childs on Document
                        @updatable {
                          children_documents {
                            __id
                            id
                          }
                        }
                      `,
                      data as unknown as customDashboardCard_update_childs$key
                    );
                  updatableData.children_documents =
                    updatableData.children_documents!.filter(
                      (c) => c.id !== id
                    ) as [];
                }
              },
            })
          }
        />
      </SheetWithPreventingDialog>
    </>
  );
};

export default CustomDashboardCard;
