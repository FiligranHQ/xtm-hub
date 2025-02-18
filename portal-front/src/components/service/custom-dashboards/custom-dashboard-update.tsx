import {
  CustomDashboardUpdateForm,
  updateCustomDashboardSchema,
} from '@/components/service/custom-dashboards/custom-dashboard-update-form';
import {
  DocumentDeleteMutation,
  DocumentUpdateMutation,
} from '@/components/service/document/document.graphql';
import {
  IconActionContext,
  IconActionsButton,
} from '@/components/ui/icon-actions';
import { SheetWithPreventingDialog } from '@/components/ui/sheet-with-preventing-dialog';
import { customDashboardUpdate_update_childs$key } from '@generated/customDashboardUpdate_update_childs.graphql';
import { documentDeleteMutation } from '@generated/documentDeleteMutation.graphql';
import {
  documentItem_fragment$data,
  documentItem_fragment$key,
} from '@generated/documentItem_fragment.graphql';
import { documentUpdateMutation } from '@generated/documentUpdateMutation.graphql';
import { Button, toast } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { useContext, useState } from 'react';
import { graphql, useMutation } from 'react-relay';
import { z } from 'zod';

// Component interface
interface DashboardUpdateProps {
  customDashboard: documentItem_fragment$data;
  data: documentItem_fragment$key;
  serviceInstanceId: string;
  connectionId: string;
  variant?: 'menu' | 'button';
}

// Component
const DashboardUpdate: React.FunctionComponent<DashboardUpdateProps> = ({
  customDashboard,
  data,
  serviceInstanceId,
  connectionId,
  variant = 'button',
}) => {
  const t = useTranslations();
  const router = useRouter();

  const [openSheet, setOpenSheet] = useState(false);
  const { setMenuOpen } = useContext(IconActionContext);

  const [deleteDocument] = useMutation<documentDeleteMutation>(
    DocumentDeleteMutation
  );
  const [updateDocumentMutation] = useMutation<documentUpdateMutation>(
    DocumentUpdateMutation
  );

  const updateDocument = (
    values: z.infer<typeof updateCustomDashboardSchema>
  ) => {
    setMenuOpen(false);
    updateDocumentMutation({
      variables: {
        documentId: customDashboard.id,
        serviceInstanceId: serviceInstanceId,
        input: {
          short_description: values.shortDescription,
          description: values.description,
          name: values.name,
          labels: values.labels,
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
    <div
      onClick={(event) => {
        event.stopPropagation();
      }}>
      {variant === 'button' ? (
        <Button
          variant="outline"
          onClick={() => {
            setOpenSheet(true);
          }}>
          {t('MenuActions.Update')}
        </Button>
      ) : (
        <IconActionsButton
          className="normal-case"
          onClick={() => {
            setOpenSheet(true);
          }}
          aria-label={t('MenuActions.Update')}>
          {t('MenuActions.Update')}
        </IconActionsButton>
      )}

      <SheetWithPreventingDialog
        open={openSheet}
        setOpen={setOpenSheet}
        title={t('Service.CustomDashboards.UpdateDashboard')}>
        <CustomDashboardUpdateForm
          customDashboard={customDashboard}
          serviceInstanceId={serviceInstanceId}
          handleSubmit={updateDocument}
          onDelete={(id) => {
            setMenuOpen(false);
            deleteDocument({
              variables: {
                documentId: id ?? customDashboard.id,
                serviceInstanceId: serviceInstanceId,
                connections: id ? [] : [connectionId],
                forceDelete: true,
              },
              updater: (store) => {
                if (id) {
                  const { updatableData } =
                    store.readUpdatableFragment<customDashboardUpdate_update_childs$key>(
                      graphql`
                        fragment customDashboardUpdate_update_childs on Document
                        @updatable {
                          children_documents {
                            __id
                            id
                          }
                        }
                      `,
                      data as unknown as customDashboardUpdate_update_childs$key
                    );
                  updatableData.children_documents =
                    updatableData.children_documents!.filter(
                      (c) => c.id !== id
                    ) as [];
                }
              },
            });
            router.push(`/service/custom_dashboards/${serviceInstanceId}`);
          }}
        />
      </SheetWithPreventingDialog>
    </div>
  );
};
export default DashboardUpdate;
